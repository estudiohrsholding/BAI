"""
Content Planner Models - Modelos de Dominio SQLModel

Define los modelos de dominio del módulo Content Planner.
"""

from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from app.infrastructure.db.base import BaseModel


class CampaignStatus(str, Enum):
    """Estado de una campaña de contenido mensual"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    PROCESSING_REMOTE = "processing_remote"  # Enviado a n8n, esperando callback
    REVIEW_READY = "review_ready"  # Contenido generado, listo para revisión
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ContentCampaign(BaseModel, table=True):
    """
    Modelo de dominio para campañas de contenido mensual.
    
    Representa una estrategia mensual de contenido (4 Posts + 1 Reel) que se
    genera y programa de forma asíncrona usando IA.
    Solo disponible para usuarios CEREBRO o superior.
    """
    
    __tablename__ = "content_planner_campaigns"
    
    user_id: int = Field(foreign_key="user.id", index=True, description="ID del usuario propietario")
    month: str = Field(..., max_length=20, description="Mes de la campaña (ej: '2025-02')")
    tone_of_voice: str = Field(..., max_length=100, description="Tono de voz (ej: 'profesional', 'amigable', 'técnico')")
    themes: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB, nullable=False),
        description="Temas o keywords para el contenido (ej: ['IA', 'Marketing', 'Innovación'])"
    )
    target_platforms: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB, nullable=False),
        description="Plataformas de destino (Instagram, Facebook, LinkedIn, etc.)"
    )
    status: CampaignStatus = Field(
        default=CampaignStatus.PENDING,
        description="Estado actual de la campaña"
    )
    scheduled_at: Optional[datetime] = Field(
        default=None,
        description="Fecha programada para iniciar la generación"
    )
    started_at: Optional[datetime] = Field(
        default=None,
        description="Fecha en que comenzó el procesamiento"
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        description="Fecha en que finalizó el procesamiento"
    )
    generated_content: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
        description="Contenido generado: 4 Posts + 1 Reel con sus textos, imágenes y programación"
    )
    error_message: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Mensaje de error si la campaña falla"
    )
    arq_job_id: Optional[str] = Field(
        default=None,
        max_length=255,
        description="ID del job de Arq para monitoreo de estado"
    )
    campaign_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
        description="Metadata adicional (reglas de publicación, hashtags preferidos, etc.)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "month": "2025-02",
                "tone_of_voice": "profesional",
                "themes": ["IA", "Marketing Digital", "Innovación"],
                "target_platforms": ["Instagram", "LinkedIn"],
                "status": "pending",
                "scheduled_at": "2025-02-01T10:00:00Z"
            }
        }

