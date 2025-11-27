"""
Chat Schemas - Pydantic Models para API Contracts

Define los esquemas de entrada y salida para los endpoints del módulo Chat.
Separa los contratos de la API de los modelos de dominio.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ============================================
# REQUEST SCHEMAS
# ============================================

class ChatMessageRequest(BaseModel):
    """Esquema para enviar un mensaje de chat"""
    
    text: str = Field(..., min_length=1, max_length=5000, description="Mensaje del usuario")
    client_id: Optional[str] = Field(None, description="ID del cliente (para widgets externos)")
    context: Optional[Dict[str, Any]] = Field(None, description="Contexto adicional (inventario, etc.)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Hola, busco un piso de 3 habitaciones",
                "client_id": "inmo-test-001",
                "context": {
                    "inventory": [
                        {"ref": "REF-001", "titulo": "Piso Centro", "precio": 185000}
                    ]
                }
            }
        }


class WidgetChatRequest(BaseModel):
    """Esquema para el endpoint público del widget"""
    
    message: str = Field(..., min_length=1, description="Mensaje del usuario")
    client_id: str = Field(..., description="ID del cliente (requerido para widgets)")
    history: List[Dict[str, str]] = Field(default_factory=list, description="Historial de conversación")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "¿Tienes pisos baratos?",
                "client_id": "inmo-test-001",
                "history": [
                    {"role": "user", "content": "Hola"},
                    {"role": "assistant", "content": "Hola, ¿en qué puedo ayudarte?"}
                ]
            }
        }


# ============================================
# RESPONSE SCHEMAS
# ============================================

class ChatMessageResponse(BaseModel):
    """Esquema para una respuesta de chat"""
    
    response: str = Field(..., description="Respuesta del motor de IA")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata adicional (tokens, modelo, etc.)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Hola, soy B.A.I. ¿En qué puedo ayudarte?",
                "metadata": {
                    "model": "gemini-2.5-flash",
                    "tokens_used": 150
                }
            }
        }


class ChatHistoryResponse(BaseModel):
    """Esquema para el historial de conversación"""
    
    messages: List["ChatMessageItem"] = Field(..., description="Lista de mensajes")
    total: int = Field(..., description="Total de mensajes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "messages": [
                    {
                        "id": 1,
                        "role": "user",
                        "content": "Hola",
                        "timestamp": "2025-11-26T10:00:00Z"
                    }
                ],
                "total": 1
            }
        }


class ChatMessageItem(BaseModel):
    """Esquema para un mensaje individual en el historial"""
    
    id: int = Field(..., description="ID del mensaje")
    role: str = Field(..., description="Rol: 'user' o 'bai'")
    content: str = Field(..., description="Contenido del mensaje")
    timestamp: datetime = Field(..., description="Timestamp del mensaje")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "role": "user",
                "content": "Hola",
                "timestamp": "2025-11-26T10:00:00Z"
            }
        }


# Actualizar forward references
ChatHistoryResponse.model_rebuild()

