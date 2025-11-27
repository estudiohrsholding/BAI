"""
Workers Module - Background Task Processing

Módulo para procesamiento de tareas asíncronas usando Arq y Redis.

Estructura:
- settings.py: Configuración del worker (WorkerSettings)
- main.py: Entry point para Arq
- queue.py: Utilidades para encolar tareas desde la API
- tasks/: Módulos de tareas específicas
"""

from app.workers.settings import WorkerSettings
from app.workers.queue import enqueue_task, get_job_status

__all__ = [
    "WorkerSettings",
    "enqueue_task",
    "get_job_status",
]

