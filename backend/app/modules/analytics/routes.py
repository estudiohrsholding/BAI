"""
Analytics Routes - Endpoints HTTP del Módulo Analytics

Define los endpoints HTTP para el módulo Analytics.
Solo maneja HTTP (request/response), delega la lógica a AnalyticsService.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional

from app.modules.analytics.schemas import (
    DashboardMetrics,
    UsageStats,
    AnalyticsResponse
)
from app.modules.analytics.service import AnalyticsService
from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.user import User
from app.infrastructure.cache.redis import get_redis_client
from sqlmodel import Session


router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


# Dependency para obtener AnalyticsService
def get_analytics_service() -> AnalyticsService:
    """Dependency factory para AnalyticsService."""
    return AnalyticsService()


@router.get(
    "/dashboard-metrics",
    response_model=DashboardMetrics,
    summary="Obtener métricas del dashboard",
    description="Retorna métricas agregadas para el dashboard principal"
)
async def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> DashboardMetrics:
    """
    Endpoint para obtener métricas del dashboard.
    
    Incluye:
    - Conversiones/Leads
    - Estado del Worker
    - Estadísticas de uso de features
    - Límites del plan actual
    
    Args:
        current_user: Usuario autenticado
        session: Sesión de base de datos
        analytics_service: Servicio de analytics (inyectado)
    
    Returns:
        DashboardMetrics: Métricas agregadas
    """
    try:
        # Obtener estado del worker (desde Redis)
        try:
            redis_client = get_redis_client()
            await redis_client.ping()
            try:
                queue_size = await redis_client.llen("arq:queue")
            except Exception:
                queue_size = 0
            worker_status = "healthy"
        except Exception:
            worker_status = "down"
            queue_size = 0
        
        # Obtener métricas del dashboard
        metrics = analytics_service.get_dashboard_metrics(
            user_id=current_user.id,
            session=session,
            worker_queue_size=worker_queue_size,
            worker_status=worker_status
        )
        
        return DashboardMetrics(**metrics)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener métricas: {str(e)}"
        )


@router.get(
    "/usage/{feature_key}",
    response_model=UsageStats,
    summary="Obtener estadísticas de uso de una feature",
    description="Retorna estadísticas de uso de una feature específica"
)
async def get_feature_usage(
    feature_key: str,
    period: str = "month",
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> UsageStats:
    """
    Endpoint para obtener estadísticas de uso de una feature.
    
    Args:
        feature_key: Clave de la feature (ej: "ai_content_generation")
        period: Período ("today", "week", "month")
        current_user: Usuario autenticado
        session: Sesión de base de datos
        analytics_service: Servicio de analytics (inyectado)
    
    Returns:
        UsageStats: Estadísticas de uso
    """
    try:
        stats = analytics_service.get_usage_stats(
            user_id=current_user.id,
            feature_key=feature_key,
            session=session,
            period=period
        )
        
        return UsageStats(**stats)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )

