"""
Analytics Models - Modelos de Dominio SQLModel

Define los modelos de dominio del módulo Analytics.
"""

from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from typing import Optional, Dict, Any
from datetime import datetime
from app.infrastructure.db.base import BaseModel


class UsageLog(BaseModel, table=True):
    """
    Modelo de dominio para tracking de uso de features.
    
    Registra cada uso de una feature premium (AI content generation, data mining, etc.)
    para métricas y límites de quota.
    """
    
    __tablename__ = "usage_logs"
    
    user_id: int = Field(foreign_key="user.id", index=True, description="ID del usuario")
    feature_key: str = Field(..., index=True, max_length=100, description="Clave de la feature usada")
    tracking_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True),
        description="Metadata adicional (modelo usado, tokens, etc.)"
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.utcnow(),
        description="Timestamp del uso"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "feature_key": "ai_content_generation",
                "tracking_metadata": {"model": "gemini-2.5-flash", "tokens": 150},
                "timestamp": "2025-01-27T10:00:00Z"
            }
        }

