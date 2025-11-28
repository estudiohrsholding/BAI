"""
Task Queue - Utilidades para Encolar Tareas

⚠️ DEPRECATED - NO USAR ESTE MÓDULO ⚠️

Este módulo está DEPRECADO porque crea nuevos pools Redis en cada llamada,
lo cual es un cuello de botella de performance crítico.

En su lugar, usa el pool singleton inyectado:
    from app.core.dependencies import ArqRedisDep
    
    @router.post("/endpoint")
    async def my_endpoint(arq_pool: ArqRedisDep):
        job = await arq_pool.enqueue_job("task_name", ...)

El pool singleton se inicializa en main.py y está disponible
globalmente como app.state.arq_pool.

Este archivo se mantiene solo para evitar breaking changes
pero será eliminado en una futura versión.
"""

# Las funciones anteriores fueron eliminadas para prevenir su uso.
# Si necesitas encolar tareas, usa el dependency ArqRedisDep en lugar de esto.

__all__ = []  # No exportar nada para prevenir uso accidental