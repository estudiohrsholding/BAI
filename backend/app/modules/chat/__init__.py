"""
Chat Module - Módulo de Dominio para Chat

Este módulo encapsula toda la funcionalidad relacionada con chat:
- Modelos de dominio
- Lógica de negocio
- Integración con motor de IA
- Gestión de prompts y personalidades
- Endpoints HTTP

Migrado desde:
- backend/app/services/bai_brain.py
- backend/app/services/ai_service.py
- backend/app/services/brain/prompts.py
- backend/app/services/brain/memory.py
- backend/app/services/brain/core.py
"""

from app.modules.chat.service import ChatService
from app.modules.chat.repository import ChatRepository
from app.modules.chat.models import ChatMessage
from app.modules.chat.utils.prompt_manager import PromptManager
from app.modules.chat.utils.email_handler import EmailCommandHandler

__all__ = [
    "ChatService",
    "ChatRepository",
    "ChatMessage",
    "PromptManager",
    "EmailCommandHandler",
]
