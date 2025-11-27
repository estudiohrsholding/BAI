"""
Content Creator Models - Modelos de Dominio SQLModel

Define los modelos de dominio del módulo Content Creator.
"""

from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from app.infrastructure.db.base import BaseModel


class CampaignStatus(str, Enum):
    """Estado de una campaña de contenido"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Campaign(BaseModel, table=True):
    """
    Modelo de dominio para campañas de contenido generado por IA.
    
    Representa una campaña completa de generación de contenido para un influencer IA.
    Solo disponible para usuarios PARTNER.
    """
    
    __tablename__ = "content_campaigns"
    
    user_id: int = Field(foreign_key="user.id", index=True, description="ID del usuario propietario")
    name: str = Field(..., max_length=255, description="Nombre de la campaña")
    influencer_name: str = Field(..., max_length=255, description="Nombre del influencer IA")
    tone_of_voice: str = Field(..., max_length=100, description="Tono de voz (ej: 'profesional', 'casual', 'humorístico')")
    platforms: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSONB, nullable=False),
        description="Plataformas de destino (Instagram, TikTok, YouTube, etc.)"
    )
    content_count: int = Field(default=10, ge=1, le=100, description="Número de piezas de contenido a generar")
    status: CampaignStatus = Field(
        default=CampaignStatus.PENDING,
        description="Estado actual de la campaña"
    )
    scheduled_at: Optional[datetime] = Field(
        default=None,
        description="Fecha programada para iniciar la campaña"
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
        description="Contenido generado (URLs de imágenes, videos, textos, etc.)"
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
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "name": "Campaña Q1 2025",
                "influencer_name": "TechGuru_AI",
                "tone_of_voice": "profesional",
                "platforms": ["Instagram", "TikTok"],
                "content_count": 20,
                "status": "pending",
                "scheduled_at": "2025-02-01T10:00:00Z"
            }
        }

