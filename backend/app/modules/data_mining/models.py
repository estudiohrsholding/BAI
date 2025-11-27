"""
Data Mining Models - Modelos de Dominio SQLModel

Define los modelos de dominio del módulo Data Mining.
"""

from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
from app.infrastructure.db.base import BaseModel


class ExtractionStatus(str, Enum):
    """Estado de una query de extracción de datos"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ExtractionQuery(BaseModel, table=True):
    """
    Modelo de dominio para queries de extracción de datos de mercado.
    
    Representa una solicitud de inteligencia de mercado que se procesa
    de forma asíncrona usando Brave Search API y análisis con IA.
    Solo disponible para usuarios CEREBRO o superior.
    """
    
    __tablename__ = "extraction_queries"
    
    user_id: int = Field(foreign_key="user.id", index=True, description="ID del usuario propietario")
    search_topic: str = Field(..., max_length=500, description="Tema o query de búsqueda")
    status: ExtractionStatus = Field(
        default=ExtractionStatus.PENDING,
        description="Estado actual de la extracción"
    )
    results: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
        description="Resultados estructurados de la extracción (JSONB)"
    )
    error_message: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Mensaje de error si la extracción falla"
    )
    arq_job_id: Optional[str] = Field(
        default=None,
        max_length=255,
        description="ID del job de Arq para monitoreo de estado"
    )
    started_at: Optional[datetime] = Field(
        default=None,
        description="Fecha en que comenzó el procesamiento"
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        description="Fecha en que finalizó el procesamiento"
    )
    query_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
        description="Metadata adicional de la query (fuentes consultadas, número de resultados, etc.)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "search_topic": "Inteligencia artificial en retail",
                "status": "completed",
                "results": {
                    "sources": [
                        {"title": "AI in Retail", "url": "https://example.com", "description": "..."}
                    ],
                    "summary": "Análisis completo del tema...",
                    "insights": ["insight1", "insight2"]
                },
                "created_at": "2025-01-27T10:00:00Z"
            }
        }

