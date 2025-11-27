"""
Content Planner Service - Lógica de Negocio del Módulo Content Planner

Este servicio orquesta la lógica de negocio de planificación de contenido:
- Creación de campañas mensuales
- Validación de inputs
- Gestión de estados

Principio: Single Responsibility (SRP)
- Este servicio solo maneja la lógica de negocio de content planning
- No conoce detalles de HTTP (routes) ni de persistencia (repository)
"""

from typing import Dict, Any, List, Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Session, select

from app.modules.content_planner.models import ContentCampaign, CampaignStatus

if TYPE_CHECKING:
    from arq import ArqRedis


class ContentPlannerService:
    """
    Servicio de negocio para el módulo Content Planner.
    
    Coordina la lógica de negocio de planificación de contenido sin conocer
    detalles de implementación de infraestructura (HTTP, base de datos).
    """
    
    def create_campaign(
        self,
        user_id: int,
        month: str,
        tone_of_voice: str,
        themes: List[str],
        target_platforms: List[str],
        session: Session,
        campaign_metadata: Optional[Dict[str, Any]] = None,
        scheduled_at: Optional[datetime] = None,
        arq_job_id: Optional[str] = None
    ) -> ContentCampaign:
        """
        Crea una nueva campaña de contenido mensual.
        
        Args:
            user_id: ID del usuario propietario
            month: Mes de la campaña (formato: 'YYYY-MM')
            tone_of_voice: Tono de voz para el contenido
            themes: Lista de temas o keywords
            target_platforms: Lista de plataformas de destino
            session: Sesión de base de datos
            campaign_metadata: Metadata adicional
            scheduled_at: Fecha programada (opcional)
            arq_job_id: ID del job de Arq (si ya fue encolado)
        
        Returns:
            ContentCampaign: Campaña creada
        
        Raises:
            ValueError: Si los datos son inválidos
        """
        # Validaciones
        if not month or not month.strip():
            raise ValueError("El mes de la campaña no puede estar vacío")
        
        if not tone_of_voice or not tone_of_voice.strip():
            raise ValueError("El tono de voz no puede estar vacío")
        
        if not themes or len(themes) == 0:
            raise ValueError("Debe especificar al menos un tema")
        
        if not target_platforms or len(target_platforms) == 0:
            raise ValueError("Debe especificar al menos una plataforma de destino")
        
        # Validar formato de mes (YYYY-MM)
        try:
            datetime.strptime(month, "%Y-%m")
        except ValueError:
            raise ValueError("El formato del mes debe ser 'YYYY-MM' (ej: '2025-02')")
        
        # Crear campaña
        campaign = ContentCampaign(
            user_id=user_id,
            month=month.strip(),
            tone_of_voice=tone_of_voice.strip(),
            themes=themes,
            target_platforms=target_platforms,
            status=CampaignStatus.PENDING,
            campaign_metadata=campaign_metadata,
            scheduled_at=scheduled_at,
            arq_job_id=arq_job_id
        )
        
        session.add(campaign)
        session.commit()
        session.refresh(campaign)
        
        return campaign
    
    def get_campaign(
        self,
        campaign_id: int,
        user_id: int,
        session: Session
    ) -> Optional[ContentCampaign]:
        """
        Obtiene una campaña específica del usuario.
        
        Args:
            campaign_id: ID de la campaña
            user_id: ID del usuario (para verificación de propiedad)
            session: Sesión de base de datos
        
        Returns:
            ContentCampaign o None si no existe o no pertenece al usuario
        """
        statement = select(ContentCampaign).where(
            ContentCampaign.id == campaign_id,
            ContentCampaign.user_id == user_id
        )
        return session.exec(statement).first()
    
    def list_campaigns(
        self,
        user_id: int,
        session: Session,
        limit: int = 50,
        offset: int = 0
    ) -> List[ContentCampaign]:
        """
        Lista las campañas del usuario.
        
        Args:
            user_id: ID del usuario
            session: Sesión de base de datos
            limit: Número máximo de resultados
            offset: Offset para paginación
        
        Returns:
            List[ContentCampaign]: Lista de campañas ordenadas por fecha de creación (más recientes primero)
        """
        statement = (
            select(ContentCampaign)
            .where(ContentCampaign.user_id == user_id)
            .order_by(ContentCampaign.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(session.exec(statement).all())
    
    def update_campaign_status(
        self,
        campaign_id: int,
        status: CampaignStatus,
        session: Session,
        generated_content: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        campaign_metadata: Optional[Dict[str, Any]] = None
    ) -> ContentCampaign:
        """
        Actualiza el estado de una campaña.
        
        Usado por el worker para actualizar el progreso.
        
        Args:
            campaign_id: ID de la campaña
            status: Nuevo estado
            session: Sesión de base de datos
            generated_content: Contenido generado (si está completada)
            error_message: Mensaje de error (si falló)
            campaign_metadata: Metadata adicional a actualizar
        
        Returns:
            ContentCampaign: Campaña actualizada
        
        Raises:
            ValueError: Si la campaña no existe
        """
        campaign = session.exec(select(ContentCampaign).where(ContentCampaign.id == campaign_id)).first()
        if not campaign:
            raise ValueError(f"Campaña con ID {campaign_id} no encontrada")
        
        campaign.status = status
        campaign.updated_at = datetime.utcnow()
        
        if status == CampaignStatus.IN_PROGRESS and not campaign.started_at:
            campaign.started_at = datetime.utcnow()
        
        if status == CampaignStatus.PROCESSING_REMOTE and not campaign.started_at:
            # Si se envía a n8n, marcar como iniciado
            campaign.started_at = datetime.utcnow()
        
        if status == CampaignStatus.REVIEW_READY:
            # Contenido generado, listo para revisión (no completado aún)
            if generated_content:
                campaign.generated_content = generated_content
        
        if status == CampaignStatus.COMPLETED:
            campaign.completed_at = datetime.utcnow()
            if generated_content:
                campaign.generated_content = generated_content
        
        if status == CampaignStatus.FAILED:
            if error_message:
                campaign.error_message = error_message
        
        if campaign_metadata:
            # Merge campaign_metadata existente con nuevo campaign_metadata
            if campaign.campaign_metadata:
                campaign.campaign_metadata = {**campaign.campaign_metadata, **campaign_metadata}
            else:
                campaign.campaign_metadata = campaign_metadata
        
        session.add(campaign)
        session.commit()
        session.refresh(campaign)
        
        return campaign
    
    async def get_job_status(
        self,
        arq_pool: "ArqRedis",  # Arq Redis pool
        campaign_id: int,
        user_id: int,
        session: Session
    ) -> Dict[str, Any]:
        """
        Obtiene el estado de un job de Arq para una campaña específica.
        
        Args:
            arq_pool: El pool de conexiones de Arq Redis.
            campaign_id: ID de la campaña.
            user_id: ID del usuario (para verificación de propiedad).
            session: Sesión de base de datos.
        
        Returns:
            Dict[str, Any]: Un diccionario con el estado del job, progreso, resultado y error.
        """
        campaign = self.get_campaign(campaign_id, user_id, session)
        if not campaign:
            raise ValueError(f"Campaña con ID {campaign_id} no encontrada o no pertenece al usuario.")
        
        if not campaign.arq_job_id:
            # Si no hay job_id, retornar el estado de la campaña en la DB
            from app.modules.content_planner.models import CampaignStatus as ContentCampaignStatus
            return {
                "status": campaign.status.value if hasattr(campaign.status, 'value') else str(campaign.status),
                "progress": 0,
                "result": None,
                "error": "No hay un job de Arq asociado a esta campaña.",
                "job_id": "N/A"
            }
        
        try:
            from arq.jobs import Job
            
            # Usar la nueva API de arq: Job(job_id, redis)
            job = Job(campaign.arq_job_id, arq_pool)
            job_status = await job.status()
            
            # Si el job no existe en Redis (expiró), usar el estado de la DB
            from app.modules.content_planner.models import CampaignStatus as ContentCampaignStatus
            if job_status is None:
                return {
                    "status": campaign.status.value if hasattr(campaign.status, 'value') else str(campaign.status),
                    "progress": 100 if campaign.status == ContentCampaignStatus.COMPLETED else 0,
                    "result": campaign.generated_content,
                    "error": campaign.error_message,
                    "job_id": campaign.arq_job_id
                }
            
            status_str = job_status
            progress = 0
            result = None
            error = None
            
            if status_str == "queued" or status_str == "deferred":
                progress = 0
            elif status_str == "running":
                # Calcular progreso estimado basado en tiempo transcurrido
                if campaign.started_at:
                    time_elapsed = (datetime.utcnow() - campaign.started_at).total_seconds()
                    estimated_total_time = 75  # 75 segundos estimados (4 Posts + 1 Reel)
                    progress = min(int((time_elapsed / estimated_total_time) * 100), 99)
                else:
                    progress = 10  # Default small progress if start time not set yet
            elif status_str == "complete":
                progress = 100
                # Intentar obtener el resultado del job
                try:
                    result = await job.result()
                except Exception:
                    # Si falla, usar el contenido generado de la DB
                    result = campaign.generated_content
            elif status_str == "failed":
                progress = 100
                try:
                    error_info = await job.result()
                    error = str(error_info) if error_info else "Job failed"
                except Exception as e:
                    # Si falla, usar el error_message de la DB
                    error = campaign.error_message or str(e)
            
            return {
                "status": status_str,
                "progress": progress,
                "result": result,
                "error": error,
                "job_id": campaign.arq_job_id
            }
        except Exception as e:
            # Si hay cualquier error al consultar Redis, fallback al estado de la DB
            from app.modules.content_planner.models import CampaignStatus as ContentCampaignStatus
            return {
                "status": campaign.status.value if hasattr(campaign.status, 'value') else str(campaign.status),
                "progress": 100 if campaign.status == ContentCampaignStatus.COMPLETED else (50 if campaign.status == ContentCampaignStatus.IN_PROGRESS else 0),
                "result": campaign.generated_content,
                "error": campaign.error_message or f"Error al consultar job en Redis: {str(e)}",
                "job_id": campaign.arq_job_id
            }

