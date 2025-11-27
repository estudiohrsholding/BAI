"""
Task Queue - Utilidades para Encolar Tareas

Proporciona funciones helper para encolar tareas desde la API.
"""

from typing import Optional, Dict, Any
from arq import create_pool
from arq.connections import RedisSettings

from app.core.config import settings


async def enqueue_task(
    task_name: str,
    **kwargs
) -> Optional[str]:
    """
    Encola una tarea en el worker de Arq.
    
    Args:
        task_name: Nombre de la función de tarea (debe estar en WorkerSettings.functions)
        **kwargs: Argumentos para pasar a la tarea
    
    Returns:
        str: ID del job (para tracking) o None si falla
    
    Example:
        job_id = await enqueue_task(
            "heavy_background_task",
            task_name="data_analysis",
            duration_seconds=10
        )
    """
    try:
        # Crear pool de Redis para Arq
        redis_settings = RedisSettings(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            database=settings.REDIS_DB,
        )
        
        redis_pool = await create_pool(redis_settings)
        
        # Encolar tarea
        job = await redis_pool.enqueue_job(task_name, **kwargs)
        
        # Cerrar pool
        await redis_pool.close()
        
        return job.job_id if job else None
    
    except Exception as e:
        print(f"Error encolando tarea {task_name}: {str(e)}")
        return None


async def get_job_status(job_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene el estado de un job.
    
    Args:
        job_id: ID del job
    
    Returns:
        Dict con información del job o None si no existe
    """
    try:
        redis_settings = RedisSettings(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            database=settings.REDIS_DB,
        )
        
        redis_pool = await create_pool(redis_settings)
        
        job = await redis_pool.get_job(job_id)
        
        await redis_pool.close()
        
        if job:
            return {
                "job_id": job.job_id,
                "status": job.status,
                "result": job.result,
                "error": str(job.exc_info) if job.exc_info else None
            }
        
        return None
    
    except Exception as e:
        print(f"Error obteniendo estado del job {job_id}: {str(e)}")
        return None

