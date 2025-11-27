"""
Arq Worker Entry Point (LEGACY)

Este archivo es legacy. Usa workers/main.py en su lugar.

DEPRECATED: Use app.workers.main.WorkerSettings
"""

from app.workers.settings import WorkerSettings

# Exportar configuración para Arq (compatibilidad)
__all__ = ["WorkerSettings"]

