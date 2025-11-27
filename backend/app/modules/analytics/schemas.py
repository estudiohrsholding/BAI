"""
Analytics Schemas - Pydantic Schemas para Request/Response

Define los esquemas Pydantic para validación de requests y responses
del módulo Analytics.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class UsageLogCreate(BaseModel):
    """Request para crear un log de uso"""
    
    feature_key: str = Field(..., description="Clave de la feature usada")
    tracking_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Metadata adicional (modelo, tokens, etc.)"
    )


class UsageStats(BaseModel):
    """Estadísticas de uso de una feature"""
    
    feature_key: str
    count: int = Field(..., description="Número de usos")
    period: str = Field(..., description="Período: 'today', 'week', 'month'")
    limit: Optional[int] = Field(default=None, description="Límite del plan (si aplica)")


class DashboardMetrics(BaseModel):
    """Métricas agregadas para el dashboard"""
    
    # Conversiones/Leads
    total_conversions: int = Field(default=0, description="Total de conversiones/leads generados")
    conversions_this_month: int = Field(default=0, description="Conversiones este mes")
    
    # Worker Status
    worker_status: str = Field(..., description="Estado del worker: 'healthy', 'degraded', 'down'")
    worker_queue_size: int = Field(default=0, description="Tamaño de la cola de workers")
    
    # Usage Quotas
    usage_stats: list[UsageStats] = Field(default_factory=list, description="Estadísticas de uso por feature")
    
    # Plan Info
    current_plan: str = Field(..., description="Plan actual del usuario")
    plan_limits: Dict[str, int] = Field(default_factory=dict, description="Límites del plan actual")


class AnalyticsResponse(BaseModel):
    """Response genérico para analytics"""
    
    success: bool = Field(default=True)
    data: Optional[Dict[str, Any]] = Field(default=None)
    message: Optional[str] = Field(default=None)

