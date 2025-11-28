"""
Content Creator Service - Lógica de Negocio del Módulo Content Creator

Este servicio orquesta la lógica de negocio de generación de contenido:
- Creación de campañas
- Validación de inputs
- Gestión de estados

Principio: Single Responsibility (SRP)
- Este servicio solo maneja la lógica de negocio de content creation
- No conoce detalles de HTTP (routes) ni de persistencia (repository)
"""

from typing import Dict, Any, List, Optional, TYPE_CHECKING
from datetime import datetime, timedelta
from sqlmodel import Session, select

from app.modules.content_creator.models import Campaign, CampaignStatus
from app.models.user import User

if TYPE_CHECKING:
    from arq import ArqRedis
    from arq.jobs import Job


class ContentCreatorService:
    """
    Servicio de negocio para el módulo Content Creator.
    
    Coordina la lógica de negocio de generación de contenido sin conocer
    detalles de implementación de infraestructura (HTTP, base de datos).
    """
    
    def create_campaign(
        self,
        user_id: int,
        name: str,
        influencer_name: str,
        tone_of_voice: str,
        platforms: List[str],
        content_count: int,
        session: Session,
        scheduled_at: Optional[datetime] = None,
        arq_job_id: Optional[str] = None
    ) -> Campaign:
        """
        Crea una nueva campaña de contenido.
        
        Args:
            user_id: ID del usuario propietario
            name: Nombre de la campaña
            influencer_name: Nombre del influencer IA
            tone_of_voice: Tono de voz
            platforms: Lista de plataformas de destino
            content_count: Número de piezas de contenido a generar
            session: Sesión de base de datos
            scheduled_at: Fecha programada (opcional)
        
        Returns:
            Campaign: Campaña creada
        
        Raises:
            ValueError: Si los datos son inválidos
        """
        # Validaciones
        if not name or not name.strip():
            raise ValueError("El nombre de la campaña no puede estar vacío")
        
        if not influencer_name or not influencer_name.strip():
            raise ValueError("El nombre del influencer no puede estar vacío")
        
        if not platforms or len(platforms) == 0:
            raise ValueError("Debe especificar al menos una plataforma")
        
        if content_count < 1 or content_count > 100:
            raise ValueError("El número de contenido debe estar entre 1 y 100")
        
        # Crear campaña
        campaign = Campaign(
            user_id=user_id,
            name=name,
            influencer_name=influencer_name,
            tone_of_voice=tone_of_voice,
            platforms=platforms,
            content_count=content_count,
            status=CampaignStatus.PENDING,
            scheduled_at=scheduled_at,
            arq_job_id=arq_job_id
        )
        
        session.add(campaign)
        session.commit()
        session.refresh(campaign)
        
        return campaign
    
    def update_campaign_job_id(
        self,
        campaign_id: int,
        arq_job_id: str,
        session: Session
    ) -> Campaign:
        """
        Actualiza el arq_job_id de una campaña.
        
        Args:
            campaign_id: ID de la campaña
            arq_job_id: ID del job de Arq
            session: Sesión de base de datos
        
        Returns:
            Campaign: Campaña actualizada
        
        Raises:
            ValueError: Si la campaña no existe
        """
        campaign = session.exec(select(Campaign).where(Campaign.id == campaign_id)).first()
        if not campaign:
            raise ValueError(f"Campaña con ID {campaign_id} no encontrada")
        
        campaign.arq_job_id = arq_job_id
        campaign.updated_at = datetime.utcnow()
        session.add(campaign)
        session.commit()
        session.refresh(campaign)
        
        return campaign
    
    def get_campaign(
        self,
        campaign_id: int,
        user_id: int,
        session: Session
    ) -> Optional[Campaign]:
        """
        Obtiene una campaña específica del usuario.
        
        Args:
            campaign_id: ID de la campaña
            user_id: ID del usuario (para verificación de propiedad)
            session: Sesión de base de datos
        
        Returns:
            Campaign o None si no existe o no pertenece al usuario
        """
        statement = select(Campaign).where(
            Campaign.id == campaign_id,
            Campaign.user_id == user_id
        )
        return session.exec(statement).first()
    
    def list_campaigns(
        self,
        user_id: int,
        session: Session,
        limit: int = 50,
        offset: int = 0
    ) -> List[Campaign]:
        """
        Lista las campañas del usuario.
        
        Args:
            user_id: ID del usuario
            session: Sesión de base de datos
            limit: Número máximo de resultados
            offset: Offset para paginación
        
        Returns:
            List[Campaign]: Lista de campañas ordenadas por fecha de creación (más recientes primero)
        """
        statement = (
            select(Campaign)
            .where(Campaign.user_id == user_id)
            .order_by(Campaign.created_at.desc())
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
        error_message: Optional[str] = None
    ) -> Campaign:
        """
        Actualiza el estado de una campaña.
        
        Usado por el worker para actualizar el progreso.
        
        Args:
            campaign_id: ID de la campaña
            status: Nuevo estado
            session: Sesión de base de datos
            generated_content: Contenido generado (si está completada)
            error_message: Mensaje de error (si falló)
        
        Returns:
            Campaign: Campaña actualizada
        
        Raises:
            ValueError: Si la campaña no existe
        """
        campaign = session.exec(select(Campaign).where(Campaign.id == campaign_id)).first()
        if not campaign:
            raise ValueError(f"Campaña con ID {campaign_id} no encontrada")
        
        campaign.status = status
        campaign.updated_at = datetime.utcnow()
        
        if status == CampaignStatus.IN_PROGRESS and not campaign.started_at:
            campaign.started_at = datetime.utcnow()
        
        if status == CampaignStatus.COMPLETED:
            campaign.completed_at = datetime.utcnow()
            if generated_content:
                campaign.generated_content = generated_content
        
        if status == CampaignStatus.FAILED:
            if error_message:
                campaign.error_message = error_message
        
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
        from arq.jobs import Job
        
        campaign = self.get_campaign(campaign_id, user_id, session)
        if not campaign:
            raise ValueError(f"Campaña con ID {campaign_id} no encontrada o no pertenece al usuario.")
        
        if not campaign.arq_job_id:
            # Si no hay job_id, retornar el estado de la campaña en la DB
            return {
                "status": campaign.status.value if hasattr(campaign.status, 'value') else str(campaign.status),
                "progress": 0,
                "result": None,
                "error": "No hay un job de Arq asociado a esta campaña.",
                "job_id": "N/A"
            }
        
        try:
            # Usar la nueva API de arq: Job(job_id, redis)
            job = Job(campaign.arq_job_id, arq_pool)
            job_status = await job.status()
            
            # Si el job no existe en Redis (expiró), usar el estado de la DB
            if job_status is None:
                return {
                    "status": campaign.status.value if hasattr(campaign.status, 'value') else str(campaign.status),
                    "progress": 100 if campaign.status == CampaignStatus.COMPLETED else 0,
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
                if campaign.started_at and campaign.content_count:
                    time_elapsed = (datetime.utcnow() - campaign.started_at).total_seconds()
                    estimated_total_time = campaign.content_count * 15  # 15 seconds per piece
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
            return {
                "status": campaign.status.value if hasattr(campaign.status, 'value') else str(campaign.status),
                "progress": 100 if campaign.status == CampaignStatus.COMPLETED else (50 if campaign.status == CampaignStatus.IN_PROGRESS else 0),
                "result": campaign.generated_content,
                "error": campaign.error_message or f"Error al consultar job en Redis: {str(e)}",
                "job_id": campaign.arq_job_id
            }

