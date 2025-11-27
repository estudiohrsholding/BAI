"""
Content Creator Schemas - Pydantic Schemas para Request/Response

Define los esquemas Pydantic para validación de requests y responses
del módulo Content Creator.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.modules.content_creator.models import CampaignStatus


class CampaignCreateRequest(BaseModel):
    """Request para crear una nueva campaña de contenido"""
    
    name: str = Field(..., min_length=1, max_length=255, description="Nombre de la campaña")
    influencer_name: str = Field(..., min_length=1, max_length=255, description="Nombre del influencer IA")
    tone_of_voice: str = Field(..., min_length=1, max_length=100, description="Tono de voz")
    platforms: List[str] = Field(
        ...,
        min_items=1,
        description="Plataformas de destino (Instagram, TikTok, YouTube, etc.)"
    )
    content_count: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Número de piezas de contenido a generar"
    )
    scheduled_at: Optional[datetime] = Field(
        default=None,
        description="Fecha programada para iniciar (opcional, si es None se inicia inmediatamente)"
    )


class CampaignResponse(BaseModel):
    """Response con información de una campaña"""
    
    id: int
    user_id: int
    name: str
    influencer_name: str
    tone_of_voice: str
    platforms: List[str]
    content_count: int
    status: CampaignStatus
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    generated_content: Optional[Dict[str, Any]]
    error_message: Optional[str]
    arq_job_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]


class CampaignJobStatusResponse(BaseModel):
    """Response con el estado del job de Arq para una campaña"""
    
    campaign_id: int
    job_id: Optional[str]
    job_status: Optional[str]  # "queued", "in_progress", "complete", "failed"
    campaign_status: CampaignStatus  # Estado en la base de datos
    progress: Optional[int] = None  # Porcentaje de progreso (0-100)
    result: Optional[Dict[str, Any]] = None  # Resultado del job si está completo
    error: Optional[str] = None  # Error si falló


class CampaignCreatedResponse(BaseModel):
    """Response cuando se crea una campaña"""
    
    campaign_id: int
    status: str = Field(default="queued", description="Estado inicial de la campaña")
    message: str = Field(..., description="Mensaje descriptivo")
    estimated_completion: Optional[datetime] = Field(
        default=None,
        description="Estimación de tiempo de finalización"
    )


class CampaignListResponse(BaseModel):
    """Response con lista de campañas"""
    
    campaigns: List[CampaignResponse]
    total: int

