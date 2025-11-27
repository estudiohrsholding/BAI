"""
Analytics Tasks - Tareas Asíncronas para Tracking

Tareas de worker para tracking de uso de features de forma asíncrona.
"""

from typing import Dict, Any, Optional

from app.modules.analytics.service import AnalyticsService
from app.infrastructure.db.session import get_session


async def track_feature_use(
    ctx,
    user_id: int,
    feature_key: str,
    tracking_metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Tarea asíncrona para trackear el uso de una feature.
    
    Esta tarea se ejecuta en background para no bloquear la API principal.
    
    Args:
        ctx: Contexto del worker (Arq)
        user_id: ID del usuario
        feature_key: Clave de la feature (ej: "ai_content_generation")
        tracking_metadata: Metadata adicional (modelo usado, tokens, etc.)
    
    Returns:
        dict con resultado del tracking
    """
    try:
        # Obtener sesión de base de datos usando context manager
        with get_session() as session:
            # Crear servicio de analytics
            analytics_service = AnalyticsService()
            
            # Registrar uso
            usage_log = analytics_service.log_feature_usage(
                user_id=user_id,
                feature_key=feature_key,
                session=session,
                tracking_metadata=tracking_metadata
            )
            
            return {
                "success": True,
                "usage_log_id": usage_log.id,
                "feature_key": feature_key,
                "user_id": user_id
            }
    
    except Exception as e:
        # Log error pero no fallar (tracking no debe romper el flujo principal)
        return {
            "success": False,
            "error": str(e),
            "feature_key": feature_key,
            "user_id": user_id
        }

