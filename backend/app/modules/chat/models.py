"""
Chat Models - Modelos de Dominio SQLModel

Define los modelos de dominio del módulo Chat usando SQLModel.
Estos modelos representan las entidades de negocio, no los contratos de API.
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime, timezone
from app.infrastructure.db.base import BaseModel


class ChatMessage(BaseModel, table=True):
    """
    Modelo de dominio para mensajes de chat.
    
    Representa un mensaje en una conversación, ya sea del usuario o de la IA.
    
    Migrado desde backend/app/models/chat.py
    """
    
    __tablename__ = "chat_messages"
    
    user_id: int = Field(foreign_key="user.id", index=True, description="ID del usuario")
    role: str = Field(..., description="Rol: 'user' o 'bai'")
    content: str = Field(..., description="Contenido del mensaje")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp del mensaje"
    )
    
    # Relaciones (opcional, si necesitas acceder al usuario)
    # user: Optional["User"] = Relationship(back_populates="messages")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "role": "user",
                "content": "Hola, busco un piso",
                "timestamp": "2025-11-26T10:00:00Z"
            }
        }

