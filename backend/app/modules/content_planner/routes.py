"""
Content Planner Routes - Endpoints HTTP del Módulo Content Planner

Define los endpoints HTTP para el módulo Content Planner.
Solo maneja HTTP (request/response), delega la lógica a ContentPlannerService.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request
from typing import List
from datetime import datetime, timedelta

from app.modules.content_planner.schemas import (
    ContentCampaignCreate,
    ContentCampaignResponse,
    ContentCampaignListResponse,
    LaunchCampaignResponse,
    CampaignStatusResponse,
)
from app.modules.content_planner.service import ContentPlannerService
from app.modules.content_planner.models import ContentCampaign, CampaignStatus
from app.api.deps import requires_plan
from app.core.database import get_session
from app.models.user import User, PlanTier
from sqlmodel import Session


router = APIRouter(prefix="/content-planner", tags=["content-planner"])


# Dependency para obtener ContentPlannerService
def get_content_planner_service() -> ContentPlannerService:
    """Dependency factory para ContentPlannerService."""
    return ContentPlannerService()


@router.post(
    "/launch-monthly-campaign",
    response_model=LaunchCampaignResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Lanzar campaña de contenido mensual",
    description="Crea una nueva campaña de contenido mensual (4 Posts + 1 Reel) y la encola para generación asíncrona. Solo disponible para usuarios CEREBRO o superior."
)
async def launch_monthly_campaign(
    request: Request,
    campaign_data: ContentCampaignCreate,
    current_user: User = Depends(requires_plan(PlanTier.CEREBRO)),
    session: Session = Depends(get_session),
    service: ContentPlannerService = Depends(get_content_planner_service)
) -> LaunchCampaignResponse:
    """
    Endpoint para lanzar una campaña de contenido mensual.
    
    **REQUIERE PLAN CEREBRO O SUPERIOR**
    
    El endpoint:
    1. Valida los datos de entrada
    2. Crea la campaña en la base de datos con estado PENDING
    3. Encola la tarea de generación de contenido en el worker pool
    4. Retorna inmediatamente con 202 Accepted (no bloquea)
    
    Args:
        request: Request de FastAPI (para acceder a arq_pool)
        campaign_data: Datos de la campaña de contenido mensual
        current_user: Usuario autenticado (debe ser CEREBRO o superior)
        session: Sesión de base de datos
        service: Servicio de content planner (inyectado)
    
    Returns:
        LaunchCampaignResponse: ID de la campaña y estado inicial
    
    Raises:
        HTTPException 403: Si el usuario no tiene el plan requerido
        HTTPException 400: Si los datos son inválidos
        HTTPException 500: Si falla al crear o encolar la campaña
    """
    try:
        # Crear campaña en la base de datos
        campaign = service.create_campaign(
            user_id=current_user.id,
            month=campaign_data.month,
            tone_of_voice=campaign_data.tone_of_voice,
            themes=campaign_data.themes,
            target_platforms=campaign_data.target_platforms,
            session=session,
            campaign_metadata=campaign_data.campaign_metadata,
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
                "schedule_monthly_content",
                campaign_id=campaign.id
            )
            
            # Guardar job_id en la campaña para monitoreo
            if job and job.job_id:
                campaign.arq_job_id = job.job_id
                session.add(campaign)
                session.commit()
                session.refresh(campaign)
            
            # Calcular estimación de finalización (5 piezas * 15 segundos = 75 segundos)
            estimated_seconds = 75  # 4 Posts + 1 Reel
            estimated_completion = datetime.utcnow() + timedelta(seconds=estimated_seconds)
            
            return LaunchCampaignResponse(
                campaign_id=campaign.id,
                status="queued",
                message=f"Campaña de contenido mensual '{campaign.month}' creada y encolada exitosamente. Se generarán 4 Posts + 1 Reel. Job ID: {job.job_id if job else 'N/A'}",
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
    response_model=ContentCampaignListResponse,
    summary="Listar campañas del usuario",
    description="Retorna todas las campañas de contenido mensual del usuario autenticado"
)
async def list_campaigns(
    current_user: User = Depends(requires_plan(PlanTier.CEREBRO)),
    session: Session = Depends(get_session),
    service: ContentPlannerService = Depends(get_content_planner_service),
    limit: int = 50,
    offset: int = 0
) -> ContentCampaignListResponse:
    """
    Endpoint para listar las campañas del usuario.
    
    **REQUIERE PLAN CEREBRO O SUPERIOR**
    
    Args:
        current_user: Usuario autenticado (debe ser CEREBRO o superior)
        session: Sesión de base de datos
        service: Servicio de content planner (inyectado)
        limit: Número máximo de resultados
        offset: Offset para paginación
    
    Returns:
        ContentCampaignListResponse: Lista de campañas
    """
    campaigns = service.list_campaigns(
        user_id=current_user.id,
        session=session,
        limit=limit,
        offset=offset
    )
    
    # Convertir a schemas de respuesta
    campaign_responses = [
        ContentCampaignResponse(
            id=campaign.id,
            user_id=campaign.user_id,
            month=campaign.month,
            tone_of_voice=campaign.tone_of_voice,
            themes=campaign.themes,
            target_platforms=campaign.target_platforms,
            status=campaign.status,
            generated_content=campaign.generated_content,
            error_message=campaign.error_message,
            arq_job_id=campaign.arq_job_id,
            scheduled_at=campaign.scheduled_at,
            started_at=campaign.started_at,
            completed_at=campaign.completed_at,
            campaign_metadata=campaign.campaign_metadata,
            created_at=campaign.created_at,
            updated_at=campaign.updated_at
        )
        for campaign in campaigns
    ]
    
    return ContentCampaignListResponse(
        campaigns=campaign_responses,
        total=len(campaign_responses)
    )


@router.get(
    "/campaigns/{campaign_id}",
    response_model=ContentCampaignResponse,
    summary="Obtener campaña específica",
    description="Retorna los detalles de una campaña específica"
)
async def get_campaign(
    campaign_id: int,
    current_user: User = Depends(requires_plan(PlanTier.CEREBRO)),
    session: Session = Depends(get_session),
    service: ContentPlannerService = Depends(get_content_planner_service)
) -> ContentCampaignResponse:
    """
    Endpoint para obtener los detalles de una campaña específica.
    
    **REQUIERE PLAN CEREBRO O SUPERIOR**
    
    Args:
        campaign_id: ID de la campaña
        current_user: Usuario autenticado (debe ser CEREBRO o superior)
        session: Sesión de base de datos
        service: Servicio de content planner (inyectado)
    
    Returns:
        ContentCampaignResponse: Detalles de la campaña
    
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
    
    return ContentCampaignResponse(
        id=campaign.id,
        user_id=campaign.user_id,
        month=campaign.month,
        tone_of_voice=campaign.tone_of_voice,
        themes=campaign.themes,
        target_platforms=campaign.target_platforms,
        status=campaign.status,
        generated_content=campaign.generated_content,
        error_message=campaign.error_message,
        arq_job_id=campaign.arq_job_id,
        scheduled_at=campaign.scheduled_at,
        started_at=campaign.started_at,
        completed_at=campaign.completed_at,
        campaign_metadata=campaign.campaign_metadata,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at
    )


@router.get(
    "/campaigns/{campaign_id}/status",
    response_model=CampaignStatusResponse,
    summary="Obtener estado del job de Arq para una campaña",
    description="Retorna el estado actual del job de Arq asociado a una campaña de contenido mensual"
)
async def get_campaign_job_status(
    request: Request,
    campaign_id: int,
    current_user: User = Depends(requires_plan(PlanTier.CEREBRO)),
    session: Session = Depends(get_session),
    service: ContentPlannerService = Depends(get_content_planner_service)
) -> CampaignStatusResponse:
    """
    Endpoint para obtener el estado del job de Arq asociado a una campaña.
    
    **REQUIERE PLAN CEREBRO O SUPERIOR**
    
    Este endpoint:
    1. Verifica que la campaña pertenezca al usuario
    2. Obtiene el job_id de la campaña
    3. Consulta el estado del job en Arq Redis
    4. Retorna el estado combinado (campaign status + job status)
    
    Args:
        request: Request de FastAPI (para acceder a arq_pool)
        campaign_id: ID de la campaña
        current_user: Usuario autenticado (debe ser CEREBRO o superior)
        session: Sesión de base de datos
        service: Servicio de content planner (inyectado)
    
    Returns:
        CampaignStatusResponse: Estado del job y de la campaña
    
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
        return CampaignStatusResponse(
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
        
        return CampaignStatusResponse(
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
        return CampaignStatusResponse(
            campaign_id=campaign_id,
            job_id=campaign.arq_job_id,
            job_status=None,
            campaign_status=campaign.status,
            progress=None,
            result=None,
            error=f"Error al consultar job: {str(e)}"
        )

