"""
Utils Endpoints - Endpoints de Utilidades

Endpoints para pruebas y utilidades del sistema.
Incluye endpoints para disparar tareas asíncronas.
"""

from fastapi import APIRouter, HTTPException, status, Request, Depends
from pydantic import BaseModel, Field
from typing import Optional

from app.api.deps import requires_feature, requires_plan, get_current_user
from app.models.user import User, PlanTier

router = APIRouter(prefix="/utils", tags=["utils"])


# ============================================
# REQUEST SCHEMAS
# ============================================

class HeavyTaskRequest(BaseModel):
    """Esquema para disparar una tarea pesada de prueba"""
    
    task_name: str = Field(default="test_task", description="Nombre de la tarea")
    duration_seconds: int = Field(default=5, ge=1, le=60, description="Duración en segundos (1-60)")
    simulate_work: bool = Field(default=True, description="Si True, simula trabajo pesado")


class JobStatusRequest(BaseModel):
    """Esquema para consultar el estado de un job"""
    
    job_id: str = Field(..., description="ID del job a consultar")


# ============================================
# RESPONSE SCHEMAS
# ============================================

class TaskEnqueuedResponse(BaseModel):
    """Respuesta cuando se encola una tarea"""
    
    job_id: str = Field(..., description="ID del job encolado")
    status: str = Field(default="queued", description="Estado inicial del job")
    message: str = Field(..., description="Mensaje descriptivo")


class JobStatusResponse(BaseModel):
    """Respuesta con el estado de un job"""
    
    job_id: str
    status: str
    result: Optional[dict] = None
    error: Optional[str] = None


# ============================================
# ENDPOINTS
# ============================================

@router.post(
    "/tasks/heavy",
    response_model=TaskEnqueuedResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Disparar tarea pesada de prueba",
    description="Encola una tarea pesada en background para pruebas del sistema de workers. Requiere autenticación."
)
async def trigger_heavy_task(
    request: Request,
    payload: HeavyTaskRequest,
    current_user: User = Depends(get_current_user),
) -> TaskEnqueuedResponse:
    """
    Endpoint para disparar una tarea pesada de prueba.
    
    Esta tarea se ejecuta en background usando Arq workers.
    No bloquea la API, retorna inmediatamente con el job_id.
    
    **REQUIERE AUTENTICACIÓN** (cualquier plan puede usar este endpoint de prueba)
    
    Args:
        request: Request de FastAPI (para acceder a arq_pool)
        payload: Datos de la tarea a ejecutar
        current_user: Usuario autenticado (cualquier plan)
    
    Returns:
        TaskEnqueuedResponse: ID del job y estado inicial
    
    Raises:
        HTTPException: Si falla al encolar la tarea
    """
    try:
        arq_pool = getattr(request.app.state, "arq_pool", None)
        if not arq_pool:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Arq worker no inicializado. Verifica el startup del backend."
            )
        
        job = await arq_pool.enqueue_job(
            "heavy_background_task",
            task_name=payload.task_name,
            duration_seconds=payload.duration_seconds,
            simulate_work=payload.simulate_work
        )
        job_id = job.job_id if job else None
        
        if not job_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al encolar la tarea. Verifica que el worker esté corriendo."
            )
        
        return TaskEnqueuedResponse(
            job_id=job_id,
            status="queued",
            message=f"Tarea '{payload.task_name}' encolada exitosamente. Job ID: {job_id}"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al encolar tarea: {str(e)}"
        )


@router.get(
    "/jobs/{job_id}",
    response_model=JobStatusResponse,
    summary="Consultar estado de un job",
    description="Obtiene el estado actual de un job asíncrono. Requiere autenticación."
)
async def get_job_status_endpoint(
    request: Request,
    job_id: str,
    current_user: User = Depends(get_current_user),
) -> JobStatusResponse:
    """
    Endpoint para consultar el estado de un job.
    
    **REQUIERE AUTENTICACIÓN** (cualquier plan puede usar este endpoint de prueba)
    
    Args:
        request: Request de FastAPI (para acceder a arq_pool)
        job_id: ID del job a consultar
        current_user: Usuario autenticado (cualquier plan)
    
    Returns:
        JobStatusResponse: Estado del job, resultado si está completo, error si falló
    
    Raises:
        HTTPException: Si el job no existe o hay error al consultarlo
    """
    try:
        arq_pool = getattr(request.app.state, "arq_pool", None)
        if not arq_pool:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Arq worker no inicializado. Verifica el startup del backend."
            )
        
        job = await arq_pool.get_job(job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job '{job_id}' no encontrado"
            )
        
        return JobStatusResponse(
            job_id=job.job_id,
            status=job.status,
            result=job.result,
            error=str(job.exc_info) if job.exc_info else None
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar job: {str(e)}"
        )


@router.get(
    "/guard/mining-access",
    summary="Verificar privilegios para minería de datos",
    description="Ejemplo de cómo aplicar un guard de plan. Solo CEREBRO o superior."
)
async def verify_mining_access(_: User = Depends(requires_plan(PlanTier.CEREBRO))) -> dict:
    return {"detail": "Tienes acceso a las capacidades de minería de datos."}

