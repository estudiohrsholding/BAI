"""
Content Creator Routes - Endpoints HTTP del Módulo Content Creator

Define los endpoints HTTP para el módulo Content Creator.
Solo maneja HTTP (request/response), delega la lógica a ContentCreatorService.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request
from typing import List
from datetime import datetime, timedelta

from app.modules.content_creator.schemas import (
    CampaignCreateRequest,
    CampaignResponse,
    CampaignCreatedResponse,
    CampaignListResponse,
    CampaignJobStatusResponse
)
from app.modules.content_creator.service import ContentCreatorService
from app.modules.content_creator.models import Campaign, CampaignStatus
from app.api.deps import requires_plan
from app.core.database import get_session
from app.models.user import User, PlanTier
from sqlmodel import Session


router = APIRouter(prefix="/content", tags=["content"])


# Dependency para obtener ContentCreatorService
def get_content_creator_service() -> ContentCreatorService:
    """Dependency factory para ContentCreatorService."""
    return ContentCreatorService()


@router.post(
    "/new-campaign",
    response_model=CampaignCreatedResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Crear nueva campaña de contenido",
    description="Crea una nueva campaña de generación de contenido para influencer IA. Solo disponible para usuarios PARTNER."
)
async def create_campaign(
    request: Request,
    campaign_data: CampaignCreateRequest,
    current_user: User = Depends(requires_plan(PlanTier.PARTNER)),
    session: Session = Depends(get_session),
    service: ContentCreatorService = Depends(get_content_creator_service)
) -> CampaignCreatedResponse:
    """
    Endpoint para crear una nueva campaña de contenido.
    
    **REQUIERE PLAN PARTNER**
    
    El endpoint:
    1. Valida los datos de entrada
    2. Crea la campaña en la base de datos con estado PENDING
    3. Encola la tarea de generación de contenido en el worker pool
    4. Retorna inmediatamente con 202 Accepted (no bloquea)
    
    Args:
        request: Request de FastAPI (para acceder a arq_pool)
        campaign_data: Datos de la campaña
        current_user: Usuario autenticado (debe ser PARTNER)
        session: Sesión de base de datos
        service: Servicio de content creator (inyectado)
    
    Returns:
        CampaignCreatedResponse: ID de la campaña y estado inicial
    
    Raises:
        HTTPException 403: Si el usuario no es PARTNER
        HTTPException 400: Si los datos son inválidos
        HTTPException 500: Si falla al crear o encolar la campaña
    """
    try:
        # Crear campaña en la base de datos
        campaign = service.create_campaign(
            user_id=current_user.id,
            name=campaign_data.name,
            influencer_name=campaign_data.influencer_name,
            tone_of_voice=campaign_data.tone_of_voice,
            platforms=campaign_data.platforms,
            content_count=campaign_data.content_count,
            session=session,
            scheduled_at=campaign_data.scheduled_at
        )
        
        # Encolar tarea de generación de contenido en el worker
        arq_pool = getattr(request.app.state, "arq_pool", None)
        if not arq_pool:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Worker pool no inicializado. Verifica el startup del backend."
            )
        
        try:
            # Encolar tarea asíncrona
            job = await arq_pool.enqueue_job(
                "generate_influencer_content",
                campaign_id=campaign.id
            )
            
            # Guardar job_id en la campaña para monitoreo
            if job and job.job_id:
                campaign.arq_job_id = job.job_id
                session.add(campaign)
                session.commit()
                session.refresh(campaign)
            
            # Calcular estimación de finalización (10-20 segundos por pieza de contenido)
            estimated_seconds = campaign.content_count * 15  # Promedio de 15 segundos por pieza
            estimated_completion = datetime.utcnow() + timedelta(seconds=estimated_seconds)
            
            return CampaignCreatedResponse(
                campaign_id=campaign.id,
                status="queued",
                message=f"Campaña '{campaign.name}' creada y encolada exitosamente. Job ID: {job.job_id if job else 'N/A'}",
                estimated_completion=estimated_completion
            )
        
        except Exception as e:
            # Si falla al encolar, actualizar estado de la campaña a FAILED
            service.update_campaign_status(
                campaign_id=campaign.id,
                status=CampaignStatus.FAILED,
                session=session,
                error_message=f"Error al encolar tarea: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al encolar tarea de generación: {str(e)}"
            )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear campaña: {str(e)}"
        )


@router.get(
    "/campaigns",
    response_model=CampaignListResponse,
    summary="Listar campañas del usuario",
    description="Retorna todas las campañas de contenido del usuario autenticado"
)
async def list_campaigns(
    current_user: User = Depends(requires_plan(PlanTier.PARTNER)),
    session: Session = Depends(get_session),
    service: ContentCreatorService = Depends(get_content_creator_service),
    limit: int = 50,
    offset: int = 0
) -> CampaignListResponse:
    """
    Endpoint para listar las campañas del usuario.
    
    **REQUIERE PLAN PARTNER**
    
    Args:
        current_user: Usuario autenticado (debe ser PARTNER)
        session: Sesión de base de datos
        service: Servicio de content creator (inyectado)
        limit: Número máximo de resultados
        offset: Offset para paginación
    
    Returns:
        CampaignListResponse: Lista de campañas
    """
    campaigns = service.list_campaigns(
        user_id=current_user.id,
        session=session,
        limit=limit,
        offset=offset
    )
    
    # Convertir a schemas de respuesta
    campaign_responses = [
        CampaignResponse(
            id=campaign.id,
            user_id=campaign.user_id,
            name=campaign.name,
            influencer_name=campaign.influencer_name,
            tone_of_voice=campaign.tone_of_voice,
            platforms=campaign.platforms,
            content_count=campaign.content_count,
            status=campaign.status,
            scheduled_at=campaign.scheduled_at,
            started_at=campaign.started_at,
            completed_at=campaign.completed_at,
            generated_content=campaign.generated_content,
            error_message=campaign.error_message,
            arq_job_id=campaign.arq_job_id,
            created_at=campaign.created_at,
            updated_at=campaign.updated_at
        )
        for campaign in campaigns
    ]
    
    return CampaignListResponse(
        campaigns=campaign_responses,
        total=len(campaign_responses)
    )


@router.get(
    "/campaigns/{campaign_id}",
    response_model=CampaignResponse,
    summary="Obtener campaña específica",
    description="Retorna los detalles de una campaña específica"
)
async def get_campaign(
    campaign_id: int,
    current_user: User = Depends(requires_plan(PlanTier.PARTNER)),
    session: Session = Depends(get_session),
    service: ContentCreatorService = Depends(get_content_creator_service)
) -> CampaignResponse:
    """
    Endpoint para obtener los detalles de una campaña específica.
    
    **REQUIERE PLAN PARTNER**
    
    Args:
        campaign_id: ID de la campaña
        current_user: Usuario autenticado (debe ser PARTNER)
        session: Sesión de base de datos
        service: Servicio de content creator (inyectado)
    
    Returns:
        CampaignResponse: Detalles de la campaña
    
    Raises:
        HTTPException 404: Si la campaña no existe o no pertenece al usuario
    """
    campaign = service.get_campaign(
        campaign_id=campaign_id,
        user_id=current_user.id,
        session=session
    )
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaña con ID {campaign_id} no encontrada"
        )
    
    return CampaignResponse(
        id=campaign.id,
        user_id=campaign.user_id,
        name=campaign.name,
        influencer_name=campaign.influencer_name,
        tone_of_voice=campaign.tone_of_voice,
        platforms=campaign.platforms,
        content_count=campaign.content_count,
        status=campaign.status,
        scheduled_at=campaign.scheduled_at,
        started_at=campaign.started_at,
        completed_at=campaign.completed_at,
        generated_content=campaign.generated_content,
        error_message=campaign.error_message,
        arq_job_id=campaign.arq_job_id,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at
    )


@router.get(
    "/campaigns/{campaign_id}/job-status",
    response_model=CampaignJobStatusResponse,
    summary="Obtener estado del job de Arq para una campaña",
    description="Retorna el estado actual del job de Arq asociado a una campaña"
)
async def get_campaign_job_status(
    request: Request,
    campaign_id: int,
    current_user: User = Depends(requires_plan(PlanTier.PARTNER)),
    session: Session = Depends(get_session),
    service: ContentCreatorService = Depends(get_content_creator_service)
) -> CampaignJobStatusResponse:
    """
    Endpoint para obtener el estado del job de Arq asociado a una campaña.
    
    **REQUIERE PLAN PARTNER**
    
    Este endpoint:
    1. Verifica que la campaña pertenezca al usuario
    2. Obtiene el job_id de la campaña
    3. Consulta el estado del job en Arq Redis
    4. Retorna el estado combinado (campaign status + job status)
    
    Args:
        request: Request de FastAPI (para acceder a arq_pool)
        campaign_id: ID de la campaña
        current_user: Usuario autenticado (debe ser PARTNER)
        session: Sesión de base de datos
        service: Servicio de content creator (inyectado)
    
    Returns:
        CampaignJobStatusResponse: Estado del job y de la campaña
    
    Raises:
        HTTPException 404: Si la campaña no existe o no pertenece al usuario
    """
    # Obtener campaña y verificar propiedad
    campaign = service.get_campaign(
        campaign_id=campaign_id,
        user_id=current_user.id,
        session=session
    )
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaña con ID {campaign_id} no encontrada"
        )
    
    # Obtener arq_pool del request
    arq_pool = getattr(request.app.state, "arq_pool", None)
    if not arq_pool:
        # Si no hay pool, retornar solo el estado de la campaña
        return CampaignJobStatusResponse(
            campaign_id=campaign_id,
            job_id=campaign.arq_job_id,
            job_status=None,
            campaign_status=campaign.status,
            progress=None,
            result=None,
            error="Worker pool no disponible"
        )
    
    try:
        # Usar el servicio para obtener el estado del job
        job_status_data = await service.get_job_status(
            arq_pool=arq_pool,
            campaign_id=campaign_id,
            user_id=current_user.id,
            session=session
        )
        
        # Mapear estados de Arq a estados legibles para la respuesta
        arq_status_map = {
            "queued": "queued",
            "deferred": "queued",
            "running": "in_progress",
            "complete": "complete",
            "failed": "failed",
            "not_found": None,
        }
        
        job_status = arq_status_map.get(job_status_data["status"], job_status_data["status"])
        
        return CampaignJobStatusResponse(
            campaign_id=campaign_id,
            job_id=job_status_data.get("job_id"),
            job_status=job_status,
            campaign_status=campaign.status,
            progress=job_status_data.get("progress"),
            result=job_status_data.get("result"),
            error=job_status_data.get("error")
        )
    
    except ValueError as e:
        # Si la campaña no existe o no pertenece al usuario
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        # Si falla la consulta, retornar estado de la campaña
        return CampaignJobStatusResponse(
            campaign_id=campaign_id,
            job_id=campaign.arq_job_id,
            job_status=None,
            campaign_status=campaign.status,
            progress=None,
            result=None,
            error=f"Error al consultar job: {str(e)}"
        )

