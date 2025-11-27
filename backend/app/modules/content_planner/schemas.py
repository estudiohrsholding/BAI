"""
Content Planner Schemas - Pydantic Schemas para Request/Response

Define los esquemas Pydantic para validación de requests y responses
del módulo Content Planner.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.modules.content_planner.models import CampaignStatus


class ContentCampaignCreate(BaseModel):
    """Request para crear una nueva campaña de contenido mensual"""
    
    month: str = Field(
        ...,
        min_length=7,
        max_length=20,
        description="Mes de la campaña (formato: 'YYYY-MM', ej: '2025-02')"
    )
    tone_of_voice: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Tono de voz para el contenido"
    )
    themes: List[str] = Field(
        ...,
        min_items=1,
        max_items=10,
        description="Lista de temas o keywords para el contenido"
    )
    target_platforms: List[str] = Field(
        ...,
        min_items=1,
        max_items=5,
        description="Plataformas de destino donde se publicará el contenido"
    )
    campaign_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Metadata adicional (reglas de publicación, hashtags, etc.)"
    )
    scheduled_at: Optional[datetime] = Field(
        default=None,
        description="Fecha programada para iniciar la generación (opcional, por defecto inmediato)"
    )


class ContentCampaignResponse(BaseModel):
    """Response con información de una campaña de contenido mensual"""
    
    id: int
    user_id: int
    month: str
    tone_of_voice: str
    themes: List[str]
    target_platforms: List[str]
    status: CampaignStatus
    generated_content: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    arq_job_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    campaign_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class LaunchCampaignResponse(BaseModel):
    """Response cuando se lanza una campaña de contenido mensual"""
    
    campaign_id: int
    status: str = Field(default="queued", description="Estado inicial de la campaña")
    message: str = Field(..., description="Mensaje descriptivo")
    estimated_completion: Optional[datetime] = Field(
        default=None,
        description="Estimación de tiempo de finalización"
    )


class ContentCampaignListResponse(BaseModel):
    """Response con lista de campañas de contenido mensual"""
    
    campaigns: list[ContentCampaignResponse]
    total: int


class CampaignStatusResponse(BaseModel):
    """Response con el estado del job de Arq para una campaña"""
    
    campaign_id: int
    job_id: Optional[str] = None
    job_status: Optional[str] = Field(
        default=None,
        description="Estado del job de Arq (queued, in_progress, complete, failed)"
    )
    campaign_status: CampaignStatus = Field(
        ...,
        description="Estado de la campaña en la base de datos"
    )
    progress: Optional[int] = Field(
        default=None,
        ge=0,
        le=100,
        description="Progreso del job (0-100)"
    )
    result: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Resultado del job cuando está completado"
    )
    error: Optional[str] = Field(
        default=None,
        description="Mensaje de error si el job falló"
    )


class N8nCallbackRequest(BaseModel):
    """Request del callback de n8n con contenido generado"""
    
    campaign_id: int = Field(..., description="ID de la campaña")
    generated_content: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Contenido generado por n8n (4 Posts + 1 Reel con textos, imágenes, etc.)"
    )
    secret_token: Optional[str] = Field(
        default=None,
        description="Token secreto para validar que el callback viene de n8n"
    )
    error: Optional[str] = Field(
        default=None,
        description="Mensaje de error si n8n falló al generar el contenido"
    )


class N8nCallbackResponse(BaseModel):
    """Response del callback de n8n"""
    
    success: bool = Field(..., description="Si el callback fue procesado correctamente")
    message: str = Field(..., description="Mensaje descriptivo")
    campaign_id: Optional[int] = Field(default=None, description="ID de la campaña procesada")

