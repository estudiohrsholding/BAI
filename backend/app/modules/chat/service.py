"""
Chat Service - Lógica de Negocio del Módulo Chat

Este servicio orquesta la lógica de negocio del chat:
- Validación de entrada
- Gestión de historial
- Llamadas al motor de IA
- Manejo de herramientas (n8n, Brave Search)
- Persistencia de mensajes
- Gestión de prompts y personalidades

Principio: Single Responsibility (SRP)
- Este servicio solo maneja la lógica de negocio del chat
- No conoce detalles de HTTP (routes) ni de persistencia (repository)

Migrado desde backend/app/services/bai_brain.py y backend/app/services/ai_service.py
"""

from typing import List, Dict, Any, Optional
from sqlmodel import Session

from app.modules.chat.engine.interface import AIEngineProtocol, AIResponse
from app.modules.chat.repository import ChatRepository
from app.modules.chat.models import ChatMessage
from app.modules.chat.utils.prompt_manager import PromptManager
from app.modules.chat.utils.email_handler import EmailCommandHandler
from app.infrastructure.cache.redis import CacheService


class ChatService:
    """
    Servicio de negocio para el módulo Chat.
    
    Coordina la lógica de negocio sin conocer detalles de implementación
    de infraestructura (base de datos, motor de IA, cache).
    """
    
    def __init__(
        self,
        ai_engine: AIEngineProtocol,
        repository: ChatRepository,
        cache: Optional[CacheService] = None
    ):
        """
        Inicializa el servicio con sus dependencias inyectadas.
        
        Args:
            ai_engine: Motor de IA (implementa AIEngineProtocol)
            repository: Repositorio para acceso a datos
            cache: Servicio de cache (opcional)
        """
        self.ai_engine = ai_engine
        self.repository = repository
        self.cache = cache
    
    async def process_message(
        self,
        user_id: int,
        message: str,
        session: Session,
        client_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        is_bai_internal: bool = False
    ) -> str:
        """
        Procesa un mensaje del usuario y genera una respuesta.
        
        Flujo:
        1. Obtiene historial de conversación
        2. Construye prompt con contexto
        3. Llama al motor de IA
        4. Guarda mensaje y respuesta
        5. Retorna respuesta
        
        Args:
            user_id: ID del usuario
            message: Mensaje del usuario
            session: Sesión de base de datos
            client_id: ID del cliente (para widgets externos)
            context: Contexto adicional (inventario, datos del cliente)
        
        Returns:
            str: Respuesta del motor de IA
        
        Raises:
            ValueError: Si el mensaje está vacío
            AIEngineError: Si el motor de IA falla
        """
        # Validación
        if not message or not message.strip():
            raise ValueError("El mensaje no puede estar vacío")
        
        # 1. Obtener historial
        history = self._get_conversation_history(
            user_id=user_id,
            session=session,
            limit=10  # Últimos 10 mensajes
        )
        
        # 2. Construir system instruction
        system_instruction = self._build_system_instruction(
            client_id=client_id,
            context=context,
            is_bai_internal=is_bai_internal
        )
        
        # 3. Generar respuesta del motor de IA
        ai_response = await self.ai_engine.generate_response(
            prompt=message,
            history=history,
            system_instruction=system_instruction,
            context=context
        )
        
        # 4. Procesar respuesta: extraer comando de email si existe
        cleaned_response, email = EmailCommandHandler.extract_and_clean(ai_response.content)
        
        # 5. Trigger email webhook si se encontró comando (fire and forget)
        if email:
            EmailCommandHandler.trigger_email_webhook(email, cleaned_response)
        
        # 6. Guardar mensaje y respuesta (transacción atómica)
        self.repository.save_conversation_pair(
            user_id=user_id,
            user_message=message,
            ai_response=cleaned_response
        )
        
        # 7. Invalidar cache si existe
        if self.cache:
            await self.cache.invalidate(f"chat_history:{user_id}")
        
        return cleaned_response
    
    def _get_conversation_history(
        self,
        user_id: int,
        session: Session,
        limit: int = 10
    ) -> List[Dict[str, str]]:
        """
        Obtiene el historial de conversación formateado para el motor de IA.
        
        Args:
            user_id: ID del usuario
            session: Sesión de base de datos
            limit: Número máximo de mensajes a retornar
        
        Returns:
            List[Dict[str, str]]: Historial en formato [{"role": "user", "content": "..."}]
        """
        messages = self.repository.get_recent_messages(
            user_id=user_id,
            limit=limit
        )
        
        # Formatear para el motor de IA
        # Compatible con formato legacy de MemoryService (formato Gemini con 'parts')
        # y formato nuevo (formato simple con 'content')
        history = []
        for msg in messages:
            # DB role "user" -> AI role "user"
            # DB role "bai" -> AI role "assistant" (o "model" para Gemini legacy)
            ai_role = "user" if msg.role == "user" else "assistant"
            history.append({
                "role": ai_role,
                "content": msg.content
            })
        
        return history
    
    def _build_system_instruction(
        self,
        client_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        is_bai_internal: bool = False
    ) -> str:
        """
        Construye las instrucciones del sistema según el contexto.
        
        Usa PromptManager para obtener los prompts correctos según el tipo de cliente.
        
        Args:
            client_id: ID del cliente (para personalización)
            context: Contexto adicional (inventario, etc.)
            is_bai_internal: Si es True, usa el prompt completo de B.A.I. con protocolo de automatización
        
        Returns:
            str: Instrucciones del sistema
        """
        # Si es el chatbot interno de B.A.I., usar prompt completo con protocolo
        if is_bai_internal:
            return PromptManager.get_bai_prompt(include_automation_protocol=True)
        
        # Para widgets externos, usar PromptManager que detecta automáticamente el tipo de cliente
        if client_id:
            return PromptManager.get_system_prompt(client_id)
        
        # Fallback: prompt genérico
        return PromptManager.BAI_BASE_PROMPT
    
    def get_conversation_history(
        self,
        user_id: int,
        session: Session
    ) -> List[ChatMessage]:
        """
        Obtiene el historial completo de conversación.
        
        Args:
            user_id: ID del usuario
            session: Sesión de base de datos
        
        Returns:
            List[ChatMessage]: Lista de mensajes ordenados por timestamp
        """
        return self.repository.get_all_messages(
            user_id=user_id
        )

