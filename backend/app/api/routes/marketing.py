"""
Marketing Routes - Gestión de Campañas de Marketing

Este módulo maneja la creación de campañas de marketing con gestión de créditos.
Las campañas se envían a n8n para su procesamiento asíncrono.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from sqlmodel import Session
import httpx
import os

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


class SavePlanRequest(BaseModel):
    """Request para guardar el plan de contenido generado por n8n."""
    pieces: list[ContentPiecePlan]


class SavePlanResponse(BaseModel):
    """Response con los IDs de las piezas creadas."""
    status: str
    message: str
    piece_ids: list[int]
    campaign_id: int


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
        SavePlanResponse con los IDs de las piezas creadas
        
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
    piece_ids = []
    try:
        for piece_data in plan.pieces:
            content_piece = ContentPiece(
                campaign_id=campaign_id,
                platform=piece_data.platform,
                type=piece_data.type,
                caption=piece_data.caption,
                visual_script=piece_data.visual_script,
                status="PENDING",
                created_at=datetime.now(timezone.utc)
            )
            session.add(content_piece)
            session.flush()  # Para obtener el ID sin hacer commit
            piece_ids.append(content_piece.id)
        
        # Actualizar el estado de la campaña a "in_progress"
        campaign.status = "in_progress"
        campaign.updated_at = datetime.now(timezone.utc)
        session.add(campaign)
        
        session.commit()
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar el plan de contenido: {str(e)}"
        )
    
    return SavePlanResponse(
        status="success",
        message=f"Plan guardado exitosamente. {len(piece_ids)} piezas creadas.",
        piece_ids=piece_ids,
        campaign_id=campaign_id
    )


class UpdateMediaRequest(BaseModel):
    """Request para actualizar el media_url de una pieza de contenido."""
    media_url: str


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
    """
    # Verificar que la campaña existe
    campaign = session.get(MarketingCampaign, campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaña con ID {campaign_id} no encontrada"
        )
    
    # Crear las piezas de contenido con estado PENDING
    piece_ids = []
    try:
        for piece_data in plan.pieces:
            content_piece = ContentPiece(
                campaign_id=campaign_id,
                platform=piece_data.platform,
                type=piece_data.type,
                caption=piece_data.caption,
                visual_script=piece_data.visual_script,
                status="PENDING",
                created_at=datetime.now(timezone.utc)
            )
            session.add(content_piece)
            session.flush()
            piece_ids.append(content_piece.id)
        
        # Actualizar el estado de la campaña a "in_progress"
        campaign.status = "in_progress"
        campaign.updated_at = datetime.now(timezone.utc)
        session.add(campaign)
        
        session.commit()
        
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar el plan de contenido: {str(e)}"
        )
    
    return SavePlanResponse(
        status="success",
        message=f"Plan guardado exitosamente. {len(piece_ids)} piezas creadas.",
        piece_ids=piece_ids,
        campaign_id=campaign_id
    )


@router.patch("/public/content/{piece_id}/update-media", response_model=UpdateMediaResponse)
async def update_content_media_public(
    piece_id: int,
    update: UpdateMediaRequest,
    _: bool = Depends(verify_service_api_key),  # Validar API key pero no usar el resultado
    session: Session = Depends(get_session)
) -> UpdateMediaResponse:
    """
    Versión pública del endpoint update-media para uso por n8n.
    
    No requiere autenticación de usuario, solo API key de servicio.
    Actualiza el media_url y cambia el estado a COMPLETED.
    """
    # Obtener la pieza de contenido
    content_piece = session.get(ContentPiece, piece_id)
    if not content_piece:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pieza de contenido con ID {piece_id} no encontrada"
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

