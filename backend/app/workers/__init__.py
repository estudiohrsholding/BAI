"""
Workers Module - Background Task Processing

Módulo para procesamiento de tareas asíncronas usando Arq y Redis.

Estructura:
- settings.py: Configuración del worker (WorkerSettings)
- main.py: Entry point para Arq
- tasks/: Módulos de tareas específicas

⚠️ IMPORTANTE: Para encolar tareas desde la API, usa el dependency ArqRedisDep:
    from app.core.dependencies import ArqRedisDep
    
    @router.post("/endpoint")
    async def my_endpoint(arq_pool: ArqRedisDep):
        job = await arq_pool.enqueue_job("task_name", ...)
"""

from app.workers.settings import WorkerSettings

__all__ = [
    "WorkerSettings",
    # enqueue_task y get_job_status fueron removidos - usar ArqRedisDep en su lugar
]

