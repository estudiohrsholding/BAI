"""
Marketing Routes - Gestión de Campañas de Marketing

Este módulo maneja la creación de campañas de marketing con gestión de créditos.
Las campañas se envían a n8n para su procesamiento asíncrono.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session
import httpx

from app.api.deps import get_current_user, requires_feature
from app.core.database import get_session
from app.models.user import User

router = APIRouter()


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
    
    # Guardar cambios en la base de datos
    try:
        session.add(user_in_session)
        session.commit()
        session.refresh(user_in_session)
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar créditos en la base de datos: {str(e)}"
        )
    
    # Enviar orden a n8n vía webhook
    n8n_webhook_url = "http://n8n:5678/webhook/marketing-campaign-trigger"
    payload = {
        "user_id": user_in_session.id,
        "email": user_in_session.email,
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
        credits_remaining={
            "monthly_video": user_in_session.monthly_credits_video,
            "extra_video": user_in_session.extra_credits_video,
            "monthly_image": user_in_session.monthly_credits_image,
            "extra_image": user_in_session.extra_credits_image,
        }
    )

