"""
Arq Worker Main Entry Point

Punto de entrada principal para ejecutar el worker de Arq.

Ejecutar con:
    arq app.workers.main.WorkerSettings

O desde Docker:
    arq app.workers.main.WorkerSettings
"""

from app.workers.settings import WorkerSettings

# Exportar configuración para Arq
# Arq busca esta clase en el módulo especificado
__all__ = ["WorkerSettings"]

