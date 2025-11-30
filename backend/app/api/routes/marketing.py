"""
Marketing Routes - Gestión de Campañas de Marketing

Este módulo maneja la creación de campañas de marketing con gestión de créditos.
Las campañas se envían a n8n para su procesamiento asíncrono.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Any, Dict, List
import httpx
import os
import re

from app.api.deps import get_current_user, requires_feature
from app.core.database import get_session
from app.core.config import settings
from app.models.user import User
from app.models.content import MarketingCampaign, ContentPiece
from datetime import datetime, timezone

router = APIRouter()


# ============================================================================
# DEPENDENCY PARA VALIDAR API KEY DE SERVICIO (n8n)
# ============================================================================

async def verify_service_api_key(
    x_api_key: str | None = Header(None, alias="X-API-Key")
) -> bool:
    """
    Dependency para validar API key de servicio (usado por n8n).
    
    Args:
        x_api_key: API key del header X-API-Key
        
    Returns:
        True si la API key es válida
        
    Raises:
        HTTPException 401 si la API key es inválida o no está configurada
    """
    expected_key = settings.N8N_SERVICE_API_KEY
    
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service API key not configured. Please set N8N_SERVICE_API_KEY in environment."
        )
    
    if not x_api_key or x_api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key. Please provide valid X-API-Key header."
        )
    
    return True


class CampaignCreateRequest(BaseModel):
    """Request model para crear una nueva campaña de marketing."""
    name: str
    influencer_name: str
    tone_of_voice: str
    platforms: list[str]
    content_count: int
    topic: str  # Tema o contexto de la campaña - REQUERIDO para que la IA sepa qué generar
    scheduled_at: str | None = None


class CampaignCreateResponse(BaseModel):
    """Response model para la creación de campaña."""
    status: str
    message: str
    campaign_id: int | None = None
    credits_remaining: dict[str, int]


@router.post("/create-campaign", response_model=CampaignCreateResponse)
async def create_campaign(
    campaign: CampaignCreateRequest,
    current_user: User = Depends(requires_feature("access_marketing")),
    session: Session = Depends(get_session)
) -> CampaignCreateResponse:
    """
    Crea una nueva campaña de marketing y descuenta los créditos correspondientes.
    
    Lógica de gasto de créditos:
    1. PRIORIDAD: Resta primero de monthly_credits_video
    2. SECUNDARIA: Si no alcanza, usa extra_credits_video
    3. Si la suma de ambos no alcanza, lanza HTTPException 402 (Payment Required)
    
    Una vez cobrado, envía la orden a n8n vía webhook.
    
    Args:
        campaign: Datos de la campaña a crear
        current_user: Usuario autenticado (requiere feature "access_marketing")
        session: Sesión de base de datos
        
    Returns:
        CampaignCreateResponse con estado y créditos restantes
        
    Raises:
        HTTPException 402 si no hay suficientes créditos
        HTTPException 500 si falla la conexión con n8n o la actualización de DB
    """
    # Merge user into session to ensure we're working with the latest data
    user_in_session = session.merge(current_user)
    session.refresh(user_in_session)
    
    # Calcular coste (asumimos que content_count son vídeos)
    cost = campaign.content_count
    
    # Calcular créditos disponibles
    total_available = user_in_session.monthly_credits_video + user_in_session.extra_credits_video
    
    # Verificar si hay suficientes créditos
    if total_available < cost:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Créditos insuficientes. Necesitas {cost} créditos, pero solo tienes {total_available} disponibles."
        )
    
    # LÓGICA DE GASTO: Primero mensuales, luego extra
    remaining_cost = cost
    monthly_used = 0
    extra_used = 0
    
    # 1. PRIORIDAD: Usar créditos mensuales primero
    if user_in_session.monthly_credits_video > 0:
        monthly_used = min(user_in_session.monthly_credits_video, remaining_cost)
        user_in_session.monthly_credits_video -= monthly_used
        remaining_cost -= monthly_used
    
    # 2. SECUNDARIA: Si aún falta, usar créditos extra
    if remaining_cost > 0 and user_in_session.extra_credits_video > 0:
        extra_used = min(user_in_session.extra_credits_video, remaining_cost)
        user_in_session.extra_credits_video -= extra_used
        remaining_cost -= extra_used
    
    # Crear registro de campaña en la base de datos
    try:
        # Guardar cambios de créditos del usuario
        session.add(user_in_session)
        session.flush()  # Para asegurar que el user_id esté disponible
        
        # Crear registro de MarketingCampaign
        marketing_campaign = MarketingCampaign(
            user_id=user_in_session.id,
            name=campaign.name,
            influencer_name=campaign.influencer_name,
            tone_of_voice=campaign.tone_of_voice,
            topic=campaign.topic,
            platforms=",".join(campaign.platforms),  # Guardar como string separado por comas
            content_count=campaign.content_count,
            status="pending",
            created_at=datetime.now(timezone.utc)
        )
        session.add(marketing_campaign)
        session.commit()
        session.refresh(marketing_campaign)
        session.refresh(user_in_session)
        
        campaign_id = marketing_campaign.id
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la campaña en la base de datos: {str(e)}"
        )
    
    # Enviar orden a n8n vía webhook (incluir campaign_id)
    n8n_webhook_url = "http://n8n:5678/webhook/marketing-campaign-trigger"
    payload = {
        "user_id": user_in_session.id,
        "email": user_in_session.email,
        "campaign_id": campaign_id,  # ID de la campaña creada en DB
        "campaign_name": campaign.name,
        "influencer": campaign.influencer_name,
        "tone": campaign.tone_of_voice,
        "platforms": campaign.platforms,
        "pieces": campaign.content_count,
        "topic": campaign.topic  # CRÍTICO: Tema/contexto para que la IA sepa qué generar
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(n8n_webhook_url, json=payload)
            response.raise_for_status()
    except httpx.TimeoutException:
        # Si n8n no responde, no fallamos la transacción (ya cobramos los créditos)
        # Pero registramos el error para debugging
        print(f"⚠️  WARNING: n8n webhook timeout para usuario {user_in_session.id}")
    except httpx.HTTPStatusError as e:
        # Si n8n devuelve error, registramos pero no fallamos
        print(f"⚠️  WARNING: n8n webhook error {e.response.status_code} para usuario {user_in_session.id}")
    except Exception as e:
        # Otros errores de conexión
        print(f"⚠️  WARNING: Error al conectar con n8n: {str(e)}")
    
    # Retornar respuesta exitosa
    return CampaignCreateResponse(
        status="success",
        message=f"Campaña '{campaign.name}' creada exitosamente. {cost} créditos descontados.",
        campaign_id=campaign_id,  # Incluir el ID de la campaña creada
        credits_remaining={
            "monthly_video": user_in_session.monthly_credits_video,
            "extra_video": user_in_session.extra_credits_video,
            "monthly_image": user_in_session.monthly_credits_image,
            "extra_image": user_in_session.extra_credits_image,
        }
    )


# ============================================================================
# ENDPOINTS PARA GESTIÓN DE PIEZAS DE CONTENIDO
# ============================================================================


class ContentPiecePlan(BaseModel):
    """Modelo para una pieza de contenido en el plan."""
    platform: str
    type: str  # Reel, Post, Story, etc.
    caption: str
    visual_script: str
    style: str | None = "cinematic"  # "cinematic" o "avatar" - estilo de video para decidir herramienta
    
    class Config:
        # Permitir nombres de campo con alias si es necesario
        populate_by_name = True


class SavePlanRequest(BaseModel):
    """Request para guardar el plan de contenido generado por n8n.
    
    IMPORTANTE: El body debe ser un objeto JSON con la clave "pieces"
    que contiene un array de ContentPiecePlan.
    
    Formato esperado:
    {
        "pieces": [
            {
                "platform": "Instagram",
                "type": "Reel",
                "caption": "...",
                "visual_script": "..."
            }
        ]
    }
    """
    pieces: list[ContentPiecePlan]
    
    class Config:
        # Asegurar que se valide correctamente
        json_schema_extra = {
            "example": {
                "pieces": [
                    {
                        "platform": "Instagram",
                        "type": "Reel",
                        "caption": "Texto del caption",
                        "visual_script": "Descripción visual",
                        "style": "cinematic"
                    }
                ]
            }
        }


# ============================================================================
# MODELOS DE RESPUESTA (definidos aquí para usar en SavePlanResponse)
# ============================================================================

class ContentPieceResponse(BaseModel):
    """Response model para una pieza de contenido."""
    id: int
    campaign_id: int
    platform: str
    type: str
    caption: str
    visual_script: str
    style: str | None  # "cinematic" o "avatar" - estilo de video
    media_url: str | None
    status: str
    created_at: datetime
    updated_at: datetime | None


class SavePlanResponse(BaseModel):
    """Response con las piezas completas creadas (incluyendo IDs reales de DB)."""
    status: str
    message: str
    campaign_id: int
    pieces: List[ContentPieceResponse] = []  # Lista completa de piezas con IDs reales
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "Plan guardado exitosamente. 3 piezas creadas.",
                "campaign_id": 123,
                "pieces": [
                    {
                        "id": 50,
                        "campaign_id": 123,
                        "platform": "Instagram",
                        "type": "Reel",
                        "caption": "Texto del caption",
                        "visual_script": "Descripción visual",
                        "style": "cinematic",
                        "media_url": None,
                        "status": "PENDING",
                        "created_at": "2025-11-30T10:00:00Z",
                        "updated_at": None
                    }
                ]
            }
        }


@router.post("/campaign/{campaign_id}/save-plan", response_model=SavePlanResponse)
async def save_content_plan(
    campaign_id: int,
    plan: SavePlanRequest,
    current_user: User = Depends(requires_feature("access_marketing")),
    session: Session = Depends(get_session)
) -> SavePlanResponse:
    """
    Guarda el plan de contenido generado por n8n.
    
    Este endpoint es llamado por n8n después de generar el plan de contenido
    (captions, scripts visuales, etc.) pero antes de generar los media (imágenes/videos).
    
    Crea registros ContentPiece con estado "PENDING" para cada pieza del plan.
    
    Args:
        campaign_id: ID de la campaña (debe existir y pertenecer al usuario)
        plan: Lista de piezas de contenido con caption y visual_script
        current_user: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        SavePlanResponse con la lista completa de piezas creadas (incluyendo IDs reales de DB, caption, visual_script, etc.)
        
    Raises:
        HTTPException 404 si la campaña no existe o no pertenece al usuario
        HTTPException 500 si falla la creación de las piezas
    """
    # Verificar que la campaña existe y pertenece al usuario
    campaign = session.get(MarketingCampaign, campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaña con ID {campaign_id} no encontrada"
        )
    
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    # Crear las piezas de contenido con estado PENDING
    created_pieces = []
    try:
        for piece_data in plan.pieces:
            content_piece = ContentPiece(
                campaign_id=campaign_id,
                platform=piece_data.platform,
                type=piece_data.type,
                caption=piece_data.caption,
                visual_script=piece_data.visual_script,
                style=piece_data.style if piece_data.style else "cinematic",  # Guardar el estilo
                status="PENDING",
                created_at=datetime.now(timezone.utc)
            )
            session.add(content_piece)
            session.flush()  # Para obtener el ID sin hacer commit
            created_pieces.append(content_piece)
        
        # Actualizar el estado de la campaña a "in_progress"
        campaign.status = "in_progress"
        campaign.updated_at = datetime.now(timezone.utc)
        session.add(campaign)
        
        session.commit()
        
        # REFRESCAR todas las piezas para obtener los datos completos de la DB
        for piece in created_pieces:
            session.refresh(piece)
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar el plan de contenido: {str(e)}"
        )
    
    # Construir respuesta con piezas completas (incluyendo IDs reales)
    pieces_response = [
        ContentPieceResponse(
            id=piece.id,
            campaign_id=piece.campaign_id,
            platform=piece.platform,
            type=piece.type,
            caption=piece.caption,
            visual_script=piece.visual_script,
            style=piece.style,  # Incluir el estilo en la respuesta
            media_url=piece.media_url,
            status=piece.status,
            created_at=piece.created_at,
            updated_at=piece.updated_at
        )
        for piece in created_pieces
    ]
    
    # LOG DEBUG: Ver qué estamos devolviendo
    print(f"✅ Save Plan Response for campaign {campaign_id}:")
    print(f"   - Total pieces created: {len(pieces_response)}")
    for p in pieces_response:
        print(f"   - Piece ID {p.id}: platform='{p.platform}', type='{p.type}', visual_script_length={len(p.visual_script)}")
    
    return SavePlanResponse(
        status="success",
        message=f"Plan guardado exitosamente. {len(pieces_response)} piezas creadas.",
        campaign_id=campaign_id,
        pieces=pieces_response
    )


class UpdateMediaRequest(BaseModel):
    """Request para actualizar el media_url de una pieza de contenido."""
    media_url: str


def extract_media_url_from_payload(payload: Dict[str, Any]) -> str | None:
    """
    Adaptador Universal: Extrae la URL del media desde cualquier formato de callback.
    
    Compatible con:
    - Fal.ai: { "video": { "url": "..." } } o { "images": [{ "url": "..." }] }
    - PiAPI: { "media_url": "..." } o { "url": "..." }
    - Otros formatos: Búsqueda recursiva de URLs
    
    Prioridad de búsqueda:
    1. Campos conocidos de Fal.ai (video.url, images[0].url)
    2. Campos genéricos (media_url, url)
    3. Búsqueda recursiva de URLs válidas
    
    Args:
        payload: Diccionario JSON del callback (cualquier estructura)
        
    Returns:
        URL del media encontrada o None si no se encuentra
    """
    if not payload:
        return None
    
    # 1. PRIORIDAD: Campos conocidos de Fal.ai
    
    # Fal.ai - Video format
    if "video" in payload:
        video_data = payload["video"]
        if isinstance(video_data, dict):
            if "url" in video_data and video_data["url"]:
                return str(video_data["url"])
            # También puede venir como "file" o "file_url"
            if "file" in video_data and video_data["file"]:
                return str(video_data["file"])
            if "file_url" in video_data and video_data["file_url"]:
                return str(video_data["file_url"])
        # Si video es directamente una string URL
        elif isinstance(video_data, str) and video_data.startswith(("http://", "https://")):
            return video_data
    
    # Fal.ai - Images format
    if "images" in payload:
        images_data = payload["images"]
        if isinstance(images_data, list) and len(images_data) > 0:
            first_image = images_data[0]
            if isinstance(first_image, dict):
                # Buscar url, file, file_url
                for key in ["url", "file", "file_url", "image_url"]:
                    if key in first_image and first_image[key]:
                        return str(first_image[key])
            elif isinstance(first_image, str) and first_image.startswith(("http://", "https://")):
                return first_image
    
    # Fal.ai - Image format (singular)
    if "image" in payload:
        image_data = payload["image"]
        if isinstance(image_data, dict):
            for key in ["url", "file", "file_url", "image_url"]:
                if key in image_data and image_data[key]:
                    return str(image_data[key])
        elif isinstance(image_data, str) and image_data.startswith(("http://", "https://")):
            return image_data
    
    # 2. SEGUNDARIA: Campos genéricos estándar
    
    # Campo directo media_url
    if "media_url" in payload and payload["media_url"]:
        return str(payload["media_url"])
    
    # Campo directo url (puede ser el media o un webhook URL, pero lo intentamos)
    if "url" in payload and payload["url"]:
        url_str = str(payload["url"])
        # Verificar que parezca una URL de media (no un webhook)
        if url_str.startswith(("http://", "https://")) and not "webhook" in url_str.lower():
            return url_str
    
    # 3. BÚSQUEDA RECURSIVA: Encontrar cualquier URL válida
    
    url_pattern = re.compile(r'https?://[^\s"\'<>)]+')
    media_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv', '.webm']
    
    def find_url_recursive(obj: Any, depth: int = 0) -> str | None:
        """
        Busca recursivamente una URL en el objeto.
        Prioriza URLs que parezcan ser de media (imágenes/videos).
        """
        # Límite de profundidad para evitar recursión infinita
        if depth > 10:
            return None
            
        if isinstance(obj, str):
            # Si es una URL válida, verificar si parece ser media
            match = url_pattern.search(obj)
            if match:
                url = match.group(0)
                # Priorizar URLs que contengan extensiones de media o dominios conocidos
                url_lower = url.lower()
                if any(ext in url_lower for ext in media_extensions):
                    return url
                # O dominios de CDN/storage comunes
                if any(domain in url_lower for domain in ['cdn.', 'storage.', 's3.', 'bucket', 'media.', 'assets.']):
                    return url
                # Si no tiene extensión pero termina con una ruta que parece media
                if not url.endswith(('.json', '.html', '.xml', '.txt', '/')) and len(url.split('/')[-1]) > 5:
                    return url
                # Como último recurso, devolver cualquier URL
                return url
                
        elif isinstance(obj, dict):
            # Buscar primero en claves que sugieran media
            priority_keys = ['url', 'file', 'file_url', 'media_url', 'image_url', 'video_url', 'src', 'href']
            for key in priority_keys:
                if key in obj:
                    result = find_url_recursive(obj[key], depth + 1)
                    if result:
                        return result
            
            # Si no encontramos en claves prioritarias, buscar en todos los valores
            for value in obj.values():
                result = find_url_recursive(value, depth + 1)
                if result:
                    return result
                    
        elif isinstance(obj, list):
            # Buscar en el primer elemento (más probable que sea el media principal)
            for item in obj:
                result = find_url_recursive(item, depth + 1)
                if result:
                    return result
        
        return None
    
    return find_url_recursive(payload)


class UpdateMediaResponse(BaseModel):
    """Response de la actualización de media."""
    status: str
    message: str
    piece_id: int
    media_url: str


@router.patch("/content/{piece_id}/update-media", response_model=UpdateMediaResponse)
async def update_content_media(
    piece_id: int,
    update: UpdateMediaRequest,
    current_user: User = Depends(requires_feature("access_marketing")),
    session: Session = Depends(get_session)
) -> UpdateMediaResponse:
    """
    Actualiza el media_url de una pieza de contenido y cambia su estado a COMPLETED.
    
    Este endpoint es llamado por n8n cuando la imagen/video ha sido generado
    y está listo para ser usado.
    
    Args:
        piece_id: ID de la pieza de contenido
        update: Request con el media_url
        current_user: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        UpdateMediaResponse con el estado actualizado
        
    Raises:
        HTTPException 404 si la pieza no existe o no pertenece al usuario
        HTTPException 500 si falla la actualización
    """
    # Obtener la pieza de contenido
    content_piece = session.get(ContentPiece, piece_id)
    if not content_piece:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pieza de contenido con ID {piece_id} no encontrada"
        )
    
    # Verificar que la campaña pertenece al usuario
    campaign = session.get(MarketingCampaign, content_piece.campaign_id)
    if not campaign or campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pieza de contenido no encontrada"
        )
    
    # Actualizar el media_url y el estado
    try:
        content_piece.media_url = update.media_url
        content_piece.status = "COMPLETED"
        content_piece.updated_at = datetime.now(timezone.utc)
        
        session.add(content_piece)
        session.commit()
        session.refresh(content_piece)
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el media: {str(e)}"
        )
    
    return UpdateMediaResponse(
        status="success",
        message=f"Media actualizado exitosamente para la pieza {piece_id}",
        piece_id=piece_id,
        media_url=update.media_url
    )


# ============================================================================
# ENDPOINTS PÚBLICOS PARA N8N (con API Key)
# ============================================================================

@router.post("/public/campaign/{campaign_id}/save-plan", response_model=SavePlanResponse)
async def save_content_plan_public(
    campaign_id: int,
    plan: SavePlanRequest,
    _: bool = Depends(verify_service_api_key),  # Validar API key pero no usar el resultado
    session: Session = Depends(get_session)
) -> SavePlanResponse:
    """
    Versión pública del endpoint save-plan para uso por n8n.
    
    No requiere autenticación de usuario, solo API key de servicio.
    Valida que la campaña exista antes de crear las piezas.
    
    Body esperado:
    {
        "pieces": [
            {
                "platform": "Instagram",
                "type": "Reel",
                "caption": "...",
                "visual_script": "...",
                "style": "cinematic"
            }
        ]
    }
    
    Returns:
        SavePlanResponse con la lista completa de piezas creadas (incluyendo IDs reales de DB).
        Esto permite que n8n use los IDs reales en los siguientes pasos del workflow, evitando
        usar los IDs ficticios que la IA genera.
        
        Formato de respuesta:
        {
            "status": "success",
            "message": "Plan guardado exitosamente. 3 piezas creadas.",
            "campaign_id": 123,
            "pieces": [
                {
                    "id": 50,  // ID REAL de la base de datos
                    "campaign_id": 123,
                    "platform": "Instagram",
                    "type": "Reel",
                    "caption": "...",
                    "visual_script": "...",
                    "style": "cinematic",
                    "media_url": null,
                    "status": "PENDING",
                    "created_at": "2025-11-30T10:00:00Z",
                    "updated_at": null
                }
            ]
        }
    """
    # Verificar que la campaña existe
    campaign = session.get(MarketingCampaign, campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaña con ID {campaign_id} no encontrada"
        )
    
    # Validar que hay piezas en el plan
    if not plan.pieces or len(plan.pieces) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El plan debe contener al menos una pieza de contenido. Formato esperado: { 'pieces': [...] }"
        )
    
    # Crear las piezas de contenido con estado PENDING
    created_pieces = []
    try:
        for piece_data in plan.pieces:
            content_piece = ContentPiece(
                campaign_id=campaign_id,
                platform=piece_data.platform,
                type=piece_data.type,
                caption=piece_data.caption,
                visual_script=piece_data.visual_script,
                style=piece_data.style if piece_data.style else "cinematic",  # Guardar el estilo
                status="PENDING",
                created_at=datetime.now(timezone.utc)
            )
            session.add(content_piece)
            session.flush()  # Para obtener el ID sin hacer commit
            created_pieces.append(content_piece)
        
        # Actualizar el estado de la campaña a "in_progress"
        campaign.status = "in_progress"
        campaign.updated_at = datetime.now(timezone.utc)
        session.add(campaign)
        
        session.commit()
        
        # REFRESCAR todas las piezas para obtener los datos completos de la DB
        for piece in created_pieces:
            session.refresh(piece)
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar el plan de contenido: {str(e)}"
        )
    
    # Construir respuesta con piezas completas (incluyendo IDs reales)
    pieces_response = [
        ContentPieceResponse(
            id=piece.id,
            campaign_id=piece.campaign_id,
            platform=piece.platform,
            type=piece.type,
            caption=piece.caption,
            visual_script=piece.visual_script,
            style=piece.style,  # Incluir el estilo en la respuesta
            media_url=piece.media_url,
            status=piece.status,
            created_at=piece.created_at,
            updated_at=piece.updated_at
        )
        for piece in created_pieces
    ]
    
    # LOG DEBUG: Ver qué estamos devolviendo
    print(f"✅ Save Plan (PUBLIC) Response for campaign {campaign_id}:")
    print(f"   - Total pieces created: {len(pieces_response)}")
    for p in pieces_response:
        print(f"   - Piece ID {p.id}: platform='{p.platform}', type='{p.type}', visual_script_length={len(p.visual_script)}")
    
    return SavePlanResponse(
        status="success",
        message=f"Plan guardado exitosamente. {len(pieces_response)} piezas creadas.",
        campaign_id=campaign_id,
        pieces=pieces_response
    )


@router.post("/public/content/{piece_id}/update-media", response_model=UpdateMediaResponse)
async def update_content_media_public(
    piece_id: int,
    request: Request,
    _: bool = Depends(verify_service_api_key),  # Validar API key pero no usar el resultado
    session: Session = Depends(get_session)
) -> UpdateMediaResponse:
    """
    Versión pública del endpoint update-media para uso por n8n y webhooks de proveedores.
    
    🔌 ADAPTADOR UNIVERSAL: Acepta cualquier formato de callback de proveedores (Fal.ai, PiAPI, etc.)
    
    No requiere autenticación de usuario, solo API key de servicio.
    Actualiza el media_url y cambia el estado a COMPLETED.
    
    Formatos soportados:
    
    1. Fal.ai Video:
       { "video": { "url": "https://..." } }
       { "video": { "file": "https://..." } }
    
    2. Fal.ai Imagen:
       { "images": [{ "url": "https://..." }] }
       { "image": { "url": "https://..." } }
    
    3. Formato genérico:
       { "media_url": "https://..." }
       { "url": "https://..." }
    
    4. Búsqueda recursiva:
       Cualquier JSON con una URL válida (https://...) en su estructura interna.
       Prioriza URLs que parezcan ser de media (con extensiones .mp4, .jpg, etc. o dominios de CDN).
    
    Args:
        piece_id: ID de la pieza de contenido (puede venir en query param o body)
        request: Request completo para extraer el body JSON flexible
        _: API key validada (no se usa)
        session: Sesión de base de datos
        
    Returns:
        UpdateMediaResponse con el estado actualizado
        
    Raises:
        HTTPException 404 si la pieza no existe
        HTTPException 400 si no se puede extraer la URL del media
        HTTPException 500 si falla la actualización
    """
    # Obtener la pieza de contenido
    content_piece = session.get(ContentPiece, piece_id)
    if not content_piece:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pieza de contenido con ID {piece_id} no encontrada"
        )
    
    # Parsear el body JSON (acepta cualquier estructura)
    try:
        payload: Dict[str, Any] = await request.json()
        # LOG DEBUG: Ver el payload completo recibido
        print(f"📦 Received webhook payload for piece {piece_id}:")
        print(f"   - Payload keys: {list(payload.keys())}")
        print(f"   - Payload preview: {str(payload)[:500]}...")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al parsear el JSON del request: {str(e)}"
        )
    
    # Extraer la URL del media usando el adaptador universal
    media_url = extract_media_url_from_payload(payload)
    
    # LOG DEBUG: Ver si se encontró la URL
    if media_url:
        print(f"✅ Extracted media URL: {media_url[:100]}...")
    else:
        print(f"⚠️  Could not extract media URL from payload")
        print(f"   - Payload structure: {str(payload)[:1000]}")
    
    if not media_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pudo extraer la URL del media desde el payload. Payload recibido: {payload}"
        )
    
    # Actualizar el media_url y el estado
    try:
        # LOG DEBUG: Ver qué estamos recibiendo
        print(f"🔄 Updating content piece {piece_id}:")
        print(f"   - Previous status: {content_piece.status}")
        print(f"   - Previous media_url: {content_piece.media_url}")
        print(f"   - New media_url: {media_url[:100] if media_url else None}...")
        
        content_piece.media_url = media_url
        content_piece.status = "COMPLETED"  # Normalizar a mayúsculas
        content_piece.updated_at = datetime.now(timezone.utc)
        
        session.add(content_piece)
        session.commit()
        session.refresh(content_piece)
        
        print(f"✅ Successfully updated piece {piece_id}:")
        print(f"   - New status: {content_piece.status}")
        print(f"   - New media_url: {content_piece.media_url[:100] if content_piece.media_url else None}...")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error updating piece {piece_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el media: {str(e)}"
        )
    
    return UpdateMediaResponse(
        status="success",
        message=f"Media actualizado exitosamente para la pieza {piece_id}",
        piece_id=piece_id,
        media_url=media_url
    )


# ============================================================================
# ENDPOINTS GET PARA LISTAR Y OBTENER CAMPAÑAS
# ============================================================================

# ContentPieceResponse ya está definido arriba, no duplicar

class MarketingCampaignDetailResponse(BaseModel):
    """Response model para los detalles completos de una campaña de marketing."""
    id: int
    user_id: int
    name: str
    influencer_name: str
    tone_of_voice: str
    topic: str
    platforms: list[str]  # Lista parseada desde el string
    content_count: int
    status: str
    created_at: datetime
    updated_at: datetime | None
    content_pieces: List[ContentPieceResponse] = []  # Piezas de contenido anidadas


class MarketingCampaignListItemResponse(BaseModel):
    """Response model para un item en la lista de campañas."""
    id: int
    name: str
    influencer_name: str
    tone_of_voice: str
    topic: str
    platforms: list[str]
    content_count: int
    status: str
    created_at: datetime
    updated_at: datetime | None
    completed_pieces_count: int  # Número de piezas completadas
    total_pieces_count: int  # Número total de piezas


class MarketingCampaignListResponse(BaseModel):
    """Response model para la lista de campañas."""
    campaigns: List[MarketingCampaignListItemResponse]
    total: int


@router.get("/campaigns", response_model=MarketingCampaignListResponse)
async def list_marketing_campaigns(
    current_user: User = Depends(requires_feature("access_marketing")),
    session: Session = Depends(get_session),
    limit: int = 50,
    offset: int = 0
) -> MarketingCampaignListResponse:
    """
    Lista todas las campañas de marketing del usuario autenticado.
    
    Incluye información sobre el progreso (piezas completadas vs total).
    
    Args:
        current_user: Usuario autenticado
        session: Sesión de base de datos
        limit: Número máximo de resultados (default: 50)
        offset: Offset para paginación (default: 0)
        
    Returns:
        MarketingCampaignListResponse con lista de campañas y total
    """
    # Obtener campañas del usuario
    statement = (
        select(MarketingCampaign)
        .where(MarketingCampaign.user_id == current_user.id)
        .order_by(MarketingCampaign.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    campaigns = session.exec(statement).all()
    
    # Contar total (para paginación)
    count_statement = select(MarketingCampaign).where(MarketingCampaign.user_id == current_user.id)
    total_campaigns = len(session.exec(count_statement).all())
    
    # Para cada campaña, contar piezas completadas
    campaign_responses = []
    for campaign in campaigns:
        # Parsear platforms (puede ser string separado por comas)
        platforms_list = campaign.platforms.split(",") if isinstance(campaign.platforms, str) else campaign.platforms
        
        # Contar piezas de contenido
        pieces_statement = select(ContentPiece).where(ContentPiece.campaign_id == campaign.id)
        all_pieces = session.exec(pieces_statement).all()
        total_pieces = len(all_pieces)
        # REGLA DE ORO: Si tiene media_url, es completada (independientemente del status)
        completed_pieces = len([
            p for p in all_pieces 
            if (p.media_url and p.media_url.strip()) or (p.status and p.status.upper() == "COMPLETED")
        ])
        
        campaign_responses.append(
            MarketingCampaignListItemResponse(
                id=campaign.id,
                name=campaign.name,
                influencer_name=campaign.influencer_name,
                tone_of_voice=campaign.tone_of_voice,
                topic=campaign.topic,
                platforms=platforms_list,
                content_count=campaign.content_count,
                status=campaign.status,
                created_at=campaign.created_at,
                updated_at=campaign.updated_at,
                completed_pieces_count=completed_pieces,
                total_pieces_count=total_pieces
            )
        )
    
    return MarketingCampaignListResponse(
        campaigns=campaign_responses,
        total=total_campaigns
    )


@router.get("/campaign/{campaign_id}", response_model=MarketingCampaignDetailResponse)
async def get_marketing_campaign(
    campaign_id: int,
    current_user: User = Depends(requires_feature("access_marketing")),
    session: Session = Depends(get_session)
) -> MarketingCampaignDetailResponse:
    """
    Obtiene los detalles completos de una campaña de marketing, incluyendo todas sus piezas de contenido.
    
    Args:
        campaign_id: ID de la campaña
        current_user: Usuario autenticado
        session: Sesión de base de datos
        
    Returns:
        MarketingCampaignDetailResponse con campaña y piezas anidadas
        
    Raises:
        HTTPException 404 si la campaña no existe o no pertenece al usuario
    """
    # Obtener campaña
    campaign = session.get(MarketingCampaign, campaign_id)
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaña con ID {campaign_id} no encontrada"
        )
    
    # Verificar que pertenece al usuario
    if campaign.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )
    
    # Obtener piezas de contenido
    pieces_statement = select(ContentPiece).where(ContentPiece.campaign_id == campaign_id)
    pieces = session.exec(pieces_statement).all()
    
    # LOG DEBUG: Ver qué piezas estamos obteniendo de la DB
    print(f"📦 Fetching campaign {campaign_id} - Found {len(pieces)} pieces:")
    for piece in pieces:
        print(f"   - Piece {piece.id}: status='{piece.status}', media_url={piece.media_url[:60] if piece.media_url else 'NULL'}...")
    
    # Parsear platforms
    platforms_list = campaign.platforms.split(",") if isinstance(campaign.platforms, str) else campaign.platforms
    
    # Construir respuesta con piezas anidadas - Asegurar que media_url se devuelve tal cual está en DB
    content_pieces = []
    for piece in pieces:
        piece_response = ContentPieceResponse(
            id=piece.id,
            campaign_id=piece.campaign_id,
            platform=piece.platform,
            type=piece.type,
            caption=piece.caption,
            visual_script=piece.visual_script,
            style=piece.style,  # Incluir el estilo en la respuesta
            media_url=piece.media_url,  # Devolver tal cual está en DB (puede ser None o string)
            status=piece.status,  # Devolver tal cual está en DB (puede ser "COMPLETED", "completed", etc.)
            created_at=piece.created_at,
            updated_at=piece.updated_at
        )
        content_pieces.append(piece_response)
        # LOG DEBUG: Ver qué estamos devolviendo
        print(f"   ✅ Serialized piece {piece.id}: status='{piece_response.status}', media_url_length={len(piece_response.media_url) if piece_response.media_url else 0}, media_url_preview={piece_response.media_url[:80] if piece_response.media_url else 'NULL'}...")
    
    response = MarketingCampaignDetailResponse(
        id=campaign.id,
        user_id=campaign.user_id,
        name=campaign.name,
        influencer_name=campaign.influencer_name,
        tone_of_voice=campaign.tone_of_voice,
        topic=campaign.topic,
        platforms=platforms_list,
        content_count=campaign.content_count,
        status=campaign.status,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
        content_pieces=content_pieces
    )
    
    # LOG DEBUG FINAL: Ver la respuesta completa que se está enviando
    print(f"📤 Sending response for campaign {campaign_id}:")
    print(f"   - Total pieces: {len(content_pieces)}")
    print(f"   - Pieces with media_url: {len([p for p in content_pieces if p.media_url])}")
    for p in content_pieces:
        if p.media_url:
            print(f"   - ✅ Piece {p.id}: HAS media_url (length={len(p.media_url)})")
        else:
            print(f"   - ❌ Piece {p.id}: NO media_url (status='{p.status}')")
    
    return response

