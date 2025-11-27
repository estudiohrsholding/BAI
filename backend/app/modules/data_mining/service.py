"""
Data Mining Service - Lógica de Negocio del Módulo Data Mining

Este servicio orquesta la lógica de negocio de extracción de datos:
- Creación de queries
- Validación de inputs
- Gestión de estados

Principio: Single Responsibility (SRP)
- Este servicio solo maneja la lógica de negocio de data mining
- No conoce detalles de HTTP (routes) ni de persistencia (repository)
"""

from typing import Dict, Any, List, Optional, TYPE_CHECKING
from datetime import datetime, timedelta
from sqlmodel import Session, select

from app.modules.data_mining.models import ExtractionQuery, ExtractionStatus

if TYPE_CHECKING:
    from arq import ArqRedis


class DataMiningService:
    """
    Servicio de negocio para el módulo Data Mining.
    
    Coordina la lógica de negocio de extracción de datos sin conocer
    detalles de implementación de infraestructura (HTTP, base de datos).
    """
    
    def create_query(
        self,
        user_id: int,
        search_topic: str,
        session: Session,
        query_metadata: Optional[Dict[str, Any]] = None,
        arq_job_id: Optional[str] = None
    ) -> ExtractionQuery:
        """
        Crea una nueva query de extracción de datos.
        
        Args:
            user_id: ID del usuario propietario
            search_topic: Tema o query de búsqueda
            session: Sesión de base de datos
            query_metadata: Metadata adicional de la query (filtros, preferencias, etc.)
            arq_job_id: ID del job de Arq (si ya fue encolado)
        
        Returns:
            ExtractionQuery: Query creada
        
        Raises:
            ValueError: Si los datos son inválidos
        """
        # Validaciones
        if not search_topic or not search_topic.strip():
            raise ValueError("El tema de búsqueda no puede estar vacío")
        
        if len(search_topic) > 500:
            raise ValueError("El tema de búsqueda no puede exceder 500 caracteres")
        
        # Crear query
        query = ExtractionQuery(
            user_id=user_id,
            search_topic=search_topic.strip(),
            status=ExtractionStatus.PENDING,
            query_metadata=query_metadata,
            arq_job_id=arq_job_id
        )
        
        session.add(query)
        session.commit()
        session.refresh(query)
        
        return query
    
    def get_query(
        self,
        query_id: int,
        user_id: int,
        session: Session
    ) -> Optional[ExtractionQuery]:
        """
        Obtiene una query específica del usuario.
        
        Args:
            query_id: ID de la query
            user_id: ID del usuario (para verificación de propiedad)
            session: Sesión de base de datos
        
        Returns:
            ExtractionQuery o None si no existe o no pertenece al usuario
        """
        statement = select(ExtractionQuery).where(
            ExtractionQuery.id == query_id,
            ExtractionQuery.user_id == user_id
        )
        return session.exec(statement).first()
    
    def list_queries(
        self,
        user_id: int,
        session: Session,
        limit: int = 50,
        offset: int = 0
    ) -> List[ExtractionQuery]:
        """
        Lista las queries del usuario.
        
        Args:
            user_id: ID del usuario
            session: Sesión de base de datos
            limit: Número máximo de resultados
            offset: Offset para paginación
        
        Returns:
            List[ExtractionQuery]: Lista de queries ordenadas por fecha de creación (más recientes primero)
        """
        statement = (
            select(ExtractionQuery)
            .where(ExtractionQuery.user_id == user_id)
            .order_by(ExtractionQuery.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(session.exec(statement).all())
    
    def update_query_status(
        self,
        query_id: int,
        status: ExtractionStatus,
        session: Session,
        results: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        query_metadata: Optional[Dict[str, Any]] = None
    ) -> ExtractionQuery:
        """
        Actualiza el estado de una query.
        
        Usado por el worker para actualizar el progreso.
        
        Args:
            query_id: ID de la query
            status: Nuevo estado
            session: Sesión de base de datos
            results: Resultados estructurados (si está completada)
            error_message: Mensaje de error (si falló)
            query_metadata: Metadata adicional de la query a actualizar
        
        Returns:
            ExtractionQuery: Query actualizada
        
        Raises:
            ValueError: Si la query no existe
        """
        query = session.exec(select(ExtractionQuery).where(ExtractionQuery.id == query_id)).first()
        if not query:
            raise ValueError(f"Query con ID {query_id} no encontrada")
        
        query.status = status
        query.updated_at = datetime.utcnow()
        
        if status == ExtractionStatus.IN_PROGRESS and not query.started_at:
            query.started_at = datetime.utcnow()
        
        if status == ExtractionStatus.COMPLETED:
            query.completed_at = datetime.utcnow()
            if results:
                query.results = results
        
        if status == ExtractionStatus.FAILED:
            if error_message:
                query.error_message = error_message
        
        if query_metadata:
            # Merge query_metadata existente con nuevo query_metadata
            if query.query_metadata:
                query.query_metadata = {**query.query_metadata, **query_metadata}
            else:
                query.query_metadata = query_metadata
        
        session.add(query)
        session.commit()
        session.refresh(query)
        
        return query
    
    async def get_job_status(
        self,
        arq_pool: "ArqRedis",  # Arq Redis pool
        query_id: int,
        user_id: int,
        session: Session
    ) -> Dict[str, Any]:
        """
        Obtiene el estado de un job de Arq para una query específica.
        
        Args:
            arq_pool: El pool de conexiones de Arq Redis.
            query_id: ID de la query.
            user_id: ID del usuario (para verificación de propiedad).
            session: Sesión de base de datos.
        
        Returns:
            Dict[str, Any]: Un diccionario con el estado del job, progreso, resultado y error.
        """
        query = self.get_query(query_id, user_id, session)
        if not query:
            raise ValueError(f"Query con ID {query_id} no encontrada o no pertenece al usuario.")
        
        if not query.arq_job_id:
            # Si no hay job_id, retornar el estado de la query en la DB
            return {
                "status": query.status.value if hasattr(query.status, 'value') else str(query.status),
                "progress": 0,
                "result": None,
                "error": "No hay un job de Arq asociado a esta query.",
                "job_id": "N/A"
            }
        
        try:
            from arq.jobs import Job
            
            # Usar la nueva API de arq: Job(job_id, redis)
            job = Job(query.arq_job_id, arq_pool)
            job_status = await job.status()
            
            # Si el job no existe en Redis (expiró), usar el estado de la DB
            if job_status is None:
                return {
                    "status": query.status.value if hasattr(query.status, 'value') else str(query.status),
                    "progress": 100 if query.status == ExtractionStatus.COMPLETED else 0,
                    "result": query.results,
                    "error": query.error_message,
                    "job_id": query.arq_job_id
                }
            
            status_str = job_status
            progress = 0
            result = None
            error = None
            
            if status_str == "queued" or status_str == "deferred":
                progress = 0
            elif status_str == "running":
                # Calcular progreso estimado basado en tiempo transcurrido
                if query.started_at:
                    time_elapsed = (datetime.utcnow() - query.started_at).total_seconds()
                    estimated_total_time = 5  # 5 segundos estimados de procesamiento
                    progress = min(int((time_elapsed / estimated_total_time) * 100), 99)
                else:
                    progress = 10  # Default small progress if start time not set yet
            elif status_str == "complete":
                progress = 100
                # Intentar obtener el resultado del job
                try:
                    result = await job.result()
                except Exception:
                    # Si falla, usar los resultados de la DB
                    result = query.results
            elif status_str == "failed":
                progress = 100
                try:
                    error_info = await job.result()
                    error = str(error_info) if error_info else "Job failed"
                except Exception as e:
                    # Si falla, usar el error_message de la DB
                    error = query.error_message or str(e)
            
            return {
                "status": status_str,
                "progress": progress,
                "result": result,
                "error": error,
                "job_id": query.arq_job_id
            }
        except Exception as e:
            # Si hay cualquier error al consultar Redis, fallback al estado de la DB
            return {
                "status": query.status.value if hasattr(query.status, 'value') else str(query.status),
                "progress": 100 if query.status == ExtractionStatus.COMPLETED else (50 if query.status == ExtractionStatus.IN_PROGRESS else 0),
                "result": query.results,
                "error": query.error_message or f"Error al consultar job en Redis: {str(e)}",
                "job_id": query.arq_job_id
            }
