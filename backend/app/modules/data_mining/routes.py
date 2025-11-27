"""
Data Mining Routes - Endpoints HTTP del Módulo Data Mining

Define los endpoints HTTP para el módulo Data Mining.
Solo maneja HTTP (request/response), delega la lógica a DataMiningService.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request
from typing import List
from datetime import datetime, timedelta

from app.modules.data_mining.schemas import (
    ExtractionQueryCreate,
    ExtractionQueryResponse,
    ExtractionQueryListResponse,
    LaunchQueryResponse,
    ExtractionQueryStatusResponse,
    ExtractionQueryResultsResponse
)
from app.modules.data_mining.service import DataMiningService
from app.modules.data_mining.models import ExtractionQuery, ExtractionStatus
from app.api.deps import requires_plan
from app.core.database import get_session
from app.models.user import User, PlanTier
from sqlmodel import Session


router = APIRouter(prefix="/data-mining", tags=["data-mining"])


# Dependency para obtener DataMiningService
def get_data_mining_service() -> DataMiningService:
    """Dependency factory para DataMiningService."""
    return DataMiningService()


@router.post(
    "/launch-query",
    response_model=LaunchQueryResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Lanzar query de extracción de datos",
    description="Crea una nueva query de extracción de datos de mercado y la encola para procesamiento asíncrono. Solo disponible para usuarios CEREBRO o superior."
)
async def launch_query(
    request: Request,
    query_data: ExtractionQueryCreate,
    current_user: User = Depends(requires_plan(PlanTier.CEREBRO)),
    session: Session = Depends(get_session),
    service: DataMiningService = Depends(get_data_mining_service)
) -> LaunchQueryResponse:
    """
    Endpoint para lanzar una query de extracción de datos.
    
    **REQUIERE PLAN CEREBRO O SUPERIOR**
    
    El endpoint:
    1. Valida los datos de entrada
    2. Crea la query en la base de datos con estado PENDING
    3. Encola la tarea de extracción en el worker pool
    4. Retorna inmediatamente con 202 Accepted (no bloquea)
    
    Args:
        request: Request de FastAPI (para acceder a arq_pool)
        query_data: Datos de la query de extracción
        current_user: Usuario autenticado (debe ser CEREBRO o superior)
        session: Sesión de base de datos
        service: Servicio de data mining (inyectado)
    
    Returns:
        LaunchQueryResponse: ID de la query y estado inicial
    
    Raises:
        HTTPException 403: Si el usuario no tiene el plan requerido
        HTTPException 400: Si los datos son inválidos
        HTTPException 500: Si falla al crear o encolar la query
    """
    try:
        # Crear query en la base de datos
        query = service.create_query(
            user_id=current_user.id,
            search_topic=query_data.search_topic,
            session=session,
            query_metadata=query_data.query_metadata
        )
        
        # Encolar tarea de extracción en el worker
        arq_pool = getattr(request.app.state, "arq_pool", None)
        if not arq_pool:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Worker pool no inicializado. Verifica el startup del backend."
            )
        
        try:
            # Encolar tarea asíncrona
            job = await arq_pool.enqueue_job(
                "launch_deep_extraction",
                query_id=query.id
            )
            
            # Guardar job_id en la query para monitoreo
            if job and job.job_id:
                query.arq_job_id = job.job_id
                session.add(query)
                session.commit()
                session.refresh(query)
            
            # Calcular estimación de finalización (3-5 segundos de procesamiento)
            estimated_seconds = 5  # Tiempo estimado de procesamiento
            estimated_completion = datetime.utcnow() + timedelta(seconds=estimated_seconds)
            
            return LaunchQueryResponse(
                query_id=query.id,
                status="queued",
                message=f"Query de extracción '{query.search_topic}' creada y encolada exitosamente. Job ID: {job.job_id if job else 'N/A'}",
                estimated_completion=estimated_completion
            )
        
        except Exception as e:
            # Si falla al encolar, actualizar estado de la query a FAILED
            service.update_query_status(
                query_id=query.id,
                status=ExtractionStatus.FAILED,
                session=session,
                error_message=f"Error al encolar tarea: {str(e)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al encolar tarea de extracción: {str(e)}"
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
            detail=f"Error al crear query: {str(e)}"
        )


@router.get(
    "/queries",
    response_model=ExtractionQueryListResponse,
    summary="Listar queries del usuario",
    description="Retorna todas las queries de extracción del usuario autenticado"
)
async def list_queries(
    current_user: User = Depends(requires_plan(PlanTier.CEREBRO)),
    session: Session = Depends(get_session),
    service: DataMiningService = Depends(get_data_mining_service),
    limit: int = 50,
    offset: int = 0
) -> ExtractionQueryListResponse:
    """
    Endpoint para listar las queries del usuario.
    
    **REQUIERE PLAN CEREBRO O SUPERIOR**
    
    Args:
        current_user: Usuario autenticado (debe ser CEREBRO o superior)
        session: Sesión de base de datos
        service: Servicio de data mining (inyectado)
        limit: Número máximo de resultados
        offset: Offset para paginación
    
    Returns:
        ExtractionQueryListResponse: Lista de queries
    """
    queries = service.list_queries(
        user_id=current_user.id,
        session=session,
        limit=limit,
        offset=offset
    )
    
    # Convertir a schemas de respuesta
    query_responses = [
        ExtractionQueryResponse(
            id=query.id,
            user_id=query.user_id,
            search_topic=query.search_topic,
            status=query.status,
            results=query.results,
            error_message=query.error_message,
            arq_job_id=query.arq_job_id,
            started_at=query.started_at,
            completed_at=query.completed_at,
            query_metadata=query.query_metadata,
            created_at=query.created_at,
            updated_at=query.updated_at
        )
        for query in queries
    ]
    
    return ExtractionQueryListResponse(
        queries=query_responses,
        total=len(query_responses)
    )


@router.get(
    "/queries/{query_id}",
    response_model=ExtractionQueryResponse,
    summary="Obtener query específica",
    description="Retorna los detalles de una query específica"
)
async def get_query(
    query_id: int,
    current_user: User = Depends(requires_plan(PlanTier.CEREBRO)),
    session: Session = Depends(get_session),
    service: DataMiningService = Depends(get_data_mining_service)
) -> ExtractionQueryResponse:
    """
    Endpoint para obtener los detalles de una query específica.
    
    **REQUIERE PLAN CEREBRO O SUPERIOR**
    
    Args:
        query_id: ID de la query
        current_user: Usuario autenticado (debe ser CEREBRO o superior)
        session: Sesión de base de datos
        service: Servicio de data mining (inyectado)
    
    Returns:
        ExtractionQueryResponse: Detalles de la query
    
    Raises:
        HTTPException 404: Si la query no existe o no pertenece al usuario
    """
    query = service.get_query(
        query_id=query_id,
        user_id=current_user.id,
        session=session
    )
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Query con ID {query_id} no encontrada"
        )
    
    return ExtractionQueryResponse(
        id=query.id,
        user_id=query.user_id,
        search_topic=query.search_topic,
        status=query.status,
        results=query.results,
        error_message=query.error_message,
        arq_job_id=query.arq_job_id,
        started_at=query.started_at,
        completed_at=query.completed_at,
        query_metadata=query.query_metadata,
        created_at=query.created_at,
        updated_at=query.updated_at
    )


@router.get(
    "/queries/{query_id}/status",
    response_model=ExtractionQueryStatusResponse,
    summary="Obtener estado del job de Arq para una query",
    description="Retorna el estado actual del job de Arq asociado a una query de extracción"
)
async def get_query_job_status(
    request: Request,
    query_id: int,
    current_user: User = Depends(requires_plan(PlanTier.CEREBRO)),
    session: Session = Depends(get_session),
    service: DataMiningService = Depends(get_data_mining_service)
) -> ExtractionQueryStatusResponse:
    """
    Endpoint para obtener el estado del job de Arq asociado a una query.
    
    **REQUIERE PLAN CEREBRO O SUPERIOR**
    
    Este endpoint:
    1. Verifica que la query pertenezca al usuario
    2. Obtiene el job_id de la query
    3. Consulta el estado del job en Arq Redis
    4. Retorna el estado combinado (query status + job status)
    
    Args:
        request: Request de FastAPI (para acceder a arq_pool)
        query_id: ID de la query
        current_user: Usuario autenticado (debe ser CEREBRO o superior)
        session: Sesión de base de datos
        service: Servicio de data mining (inyectado)
    
    Returns:
        ExtractionQueryStatusResponse: Estado del job y de la query
    
    Raises:
        HTTPException 404: Si la query no existe o no pertenece al usuario
    """
    # Obtener query y verificar propiedad
    query = service.get_query(
        query_id=query_id,
        user_id=current_user.id,
        session=session
    )
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Query con ID {query_id} no encontrada"
        )
    
    # Obtener arq_pool del request
    arq_pool = getattr(request.app.state, "arq_pool", None)
    if not arq_pool:
        # Si no hay pool, retornar solo el estado de la query
        return ExtractionQueryStatusResponse(
            query_id=query_id,
            job_id=query.arq_job_id,
            job_status=None,
            query_status=query.status,
            progress=None,
            result=None,
            error="Worker pool no disponible"
        )
    
    try:
        # Usar el servicio para obtener el estado del job
        job_status_data = await service.get_job_status(
            arq_pool=arq_pool,
            query_id=query_id,
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
        
        return ExtractionQueryStatusResponse(
            query_id=query_id,
            job_id=job_status_data.get("job_id"),
            job_status=job_status,
            query_status=query.status,
            progress=job_status_data.get("progress"),
            result=job_status_data.get("result"),
            error=job_status_data.get("error")
        )
    
    except ValueError as e:
        # Si la query no existe o no pertenece al usuario
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        # Si falla la consulta, retornar estado de la query
        return ExtractionQueryStatusResponse(
            query_id=query_id,
            job_id=query.arq_job_id,
            job_status=None,
            query_status=query.status,
            progress=None,
            result=None,
            error=f"Error al consultar job: {str(e)}"
        )


@router.get(
    "/queries/{query_id}/results",
    response_model=ExtractionQueryResultsResponse,
    summary="Obtener resultados estructurados de una query",
    description="Retorna los resultados estructurados (JSONB) de una query de extracción completada. Solo disponible para usuarios CEREBRO o superior."
)
async def get_query_results(
    query_id: int,
    current_user: User = Depends(requires_plan(PlanTier.CEREBRO)),
    session: Session = Depends(get_session),
    service: DataMiningService = Depends(get_data_mining_service)
) -> ExtractionQueryResultsResponse:
    """
    Endpoint para obtener los resultados estructurados de una query completada.
    
    **REQUIERE PLAN CEREBRO O SUPERIOR**
    
    Este endpoint:
    1. Verifica que la query pertenezca al usuario
    2. Verifica que la query esté completada
    3. Retorna los resultados estructurados (JSONB) de la extracción
    
    Args:
        query_id: ID de la query
        current_user: Usuario autenticado (debe ser CEREBRO o superior)
        session: Sesión de base de datos
        service: Servicio de data mining (inyectado)
    
    Returns:
        ExtractionQueryResultsResponse: Resultados estructurados de la query
    
    Raises:
        HTTPException 404: Si la query no existe o no pertenece al usuario
        HTTPException 400: Si la query no está completada o no tiene resultados
    """
    # Obtener query y verificar propiedad
    query = service.get_query(
        query_id=query_id,
        user_id=current_user.id,
        session=session
    )
    
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Query con ID {query_id} no encontrada"
        )
    
    # Verificar que la query esté completada
    if query.status != ExtractionStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La query con ID {query_id} no está completada. Estado actual: {query.status.value}"
        )
    
    # Verificar que tenga resultados
    if not query.results:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La query con ID {query_id} no tiene resultados disponibles"
        )
    
    return ExtractionQueryResultsResponse(
        query_id=query.id,
        search_topic=query.search_topic,
        results=query.results,
        completed_at=query.completed_at,
        query_metadata=query.query_metadata
    )

