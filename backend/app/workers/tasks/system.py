"""
System Tasks - Tareas del Sistema

Tareas de prueba y mantenimiento del sistema.
Incluye tareas de health check, pruebas de carga, etc.
"""

import asyncio
import logging
from typing import Dict, Any


async def heavy_background_task(
    ctx: Dict[str, Any],
    task_name: str = "default_task",
    duration_seconds: int = 5,
    simulate_work: bool = True
) -> Dict[str, Any]:
    """
    Tarea de prueba que simula un proceso pesado en background.
    
    Esta tarea demuestra cómo ejecutar trabajos largos sin bloquear la API.
    Útil para pruebas de concepto y validación del sistema de workers.
    
    Args:
        ctx: Contexto del worker (contiene Redis, logger, etc.)
        task_name: Nombre descriptivo de la tarea
        duration_seconds: Duración en segundos de la simulación
        simulate_work: Si True, simula trabajo pesado; si False, completa inmediatamente
    
    Returns:
        Dict con resultados de la tarea:
        {
            "status": "completed",
            "task_name": str,
            "duration": float,
            "message": str
        }
    
    Example:
        # Desde un endpoint:
        from app.workers.queue import enqueue_task
        job_id = await enqueue_task("heavy_background_task", task_name="data_analysis", duration_seconds=10)
    """
    logger = ctx.get("logger") or logging.getLogger("bai.worker.tasks")
    
    logger.info(
        f"Task started - Name: {task_name}, Duration: {duration_seconds}s, Simulate: {simulate_work}"
    )
    
    start_time = asyncio.get_event_loop().time()
    
    try:
        if simulate_work:
            # Simular trabajo pesado (procesamiento, cálculos, etc.)
            # En producción, aquí iría la lógica real (data mining, análisis, etc.)
            for i in range(duration_seconds):
                # Simular procesamiento
                await asyncio.sleep(1)
                
                # Log progreso cada segundo
                progress = ((i + 1) / duration_seconds) * 100
                logger.debug(
                    f"Task progress - {task_name}: {progress:.1f}% ({i + 1}/{duration_seconds}s)"
                )
        else:
            # Completar inmediatamente (para pruebas rápidas)
            await asyncio.sleep(0.1)
        
        end_time = asyncio.get_event_loop().time()
        actual_duration = end_time - start_time
        
        result = {
            "status": "completed",
            "task_name": task_name,
            "duration": round(actual_duration, 2),
            "message": f"Tarea '{task_name}' completada exitosamente en {actual_duration:.2f} segundos"
        }
        
        logger.info(
            f"Task completed - {task_name} in {actual_duration:.2f}s"
        )
        
        return result
    
    except Exception as e:
        logger.error(
            f"Task failed - {task_name}: {str(e)} ({type(e).__name__})"
        )
        
        return {
            "status": "failed",
            "task_name": task_name,
            "error": str(e),
            "error_type": type(e).__name__
        }

