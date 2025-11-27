"""
AI Service - Service Layer for AI Operations

This service encapsulates all AI-related business logic, providing a clean
interface for the API layer. It coordinates with the brain modules (core, memory, prompts, tools)
to generate AI responses.

Architecture Pattern: Service Layer
- Routes (API layer) should only handle HTTP concerns
- This service handles all business logic related to AI
- Brain modules handle low-level AI operations
"""

import os
from typing import Optional, Dict, Any, List
from sqlmodel import Session

from app.services.brain.prompts import PromptManager
from app.services.brain.tools import ToolExecutor
from app.services.brain.memory import MemoryService
from app.services.brain.core import NeuralCore, EmailCommandHandler
from app.core.database import engine
from fastapi.concurrency import run_in_threadpool


class AIService:
    """
    Service for AI operations.
    
    This service provides high-level methods for generating AI responses,
    handling both internal B.A.I. chatbot and external widget use cases.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the AI Service.
        
        Args:
            api_key: Google API key. If None, will read from GOOGLE_API_KEY env var.
        """
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY is required but not found in environment")
    
    def generate_response(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None,
        session: Optional[Session] = None
    ) -> str:
        """
        Generate an AI response based on a prompt and context.
        
        This is a high-level method that coordinates:
        - System prompt generation
        - Context preparation
        - AI model invocation
        - Response processing
        
        Args:
            prompt: The user's input message
            context: Optional context dictionary with additional information
            user_id: Optional user ID for personalized responses and history
            session: Optional database session for history retrieval
            
        Returns:
            The AI-generated response string
            
        Raises:
            ValueError: If API key is missing
            Exception: If AI generation fails
        """
        # This method can be extended for future use cases
        # For now, it's a placeholder that delegates to specialized methods
        raise NotImplementedError(
            "Use generate_bai_response() or generate_widget_response() instead"
        )
    
    async def generate_bai_response(
        self,
        user_input: str,
        session: Session,
        user_id: int
    ) -> str:
        """
        Generate a response for the internal B.A.I. chatbot.
        
        This method handles the full orchestration:
        - Tool execution (n8n, Brave Search)
        - Memory retrieval (chat history)
        - Prompt generation
        - AI response generation
        - Email command processing
        - History persistence
        
        Args:
            user_input: The user's message
            session: Database session for history and persistence
            user_id: The ID of the user making the request
            
        Returns:
            The AI-generated response string
        """
        # Execute tools (n8n, Brave Search) - async (must be outside threadpool)
        tool_result = await ToolExecutor.detect_and_execute(
            user_input=user_input,
            user_id=user_id,
            session=session
        )
        
        # Get system prompt
        system_prompt = PromptManager.get_bai_prompt(include_automation_protocol=True)
        
        # Prepare context update from tool execution
        context_update = tool_result.context_update if tool_result.executed else None
        
        # Execute neural processing in threadpool (Gemini API is blocking)
        def _orchestrate():
            # Instanciar Core
            neural = NeuralCore(api_key=self.api_key)
            
            with Session(engine) as thread_session:
                try:
                    # Recuperar Memoria (Historial formateado)
                    history = MemoryService.get_formatted_history(
                        user_id=user_id,
                        limit=MemoryService.DEFAULT_HISTORY_LIMIT,
                        session=thread_session
                    )
                    
                    # Generar Respuesta Neuronal
                    response_text = neural.generate_with_history(
                        user_input=user_input,
                        system_instruction=system_prompt,
                        history=history,
                        context_update=context_update
                    )
                    
                    # Procesar respuesta: extraer comando de email si existe
                    cleaned_response, email = neural.process_response(response_text)
                    
                    # Trigger email webhook si se encontró comando (fire and forget)
                    if email:
                        EmailCommandHandler.trigger_email_webhook(email, cleaned_response)
                    
                    # Guardar par de conversación atómicamente
                    MemoryService.save_conversation_pair(
                        session=thread_session,
                        user_message=user_input,
                        ai_response=cleaned_response,
                        user_id=user_id
                    )
                    
                    return cleaned_response
                    
                except ValueError as e:
                    # API key error
                    return f"System Alert: {str(e)}"
                except Exception as e:
                    thread_session.rollback()
                    return f"I'm having a glitch connecting to my new brain (Gemini 2.5): {str(e)}"
        
        return await run_in_threadpool(_orchestrate)
    
    async def generate_widget_response(
        self,
        message: str,
        client_id: str,
        history: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """
        Generate a response for external widget chat.
        
        This method handles widget requests with custom personas based on client_id.
        Supports conversation history for context retention.
        
        Args:
            message: The user's message/query
            client_id: The client identifier (e.g., 'inmo-test-001') to determine persona
            history: Optional conversation history list from frontend (default: empty list)
            
        Returns:
            The AI-generated response string
        """
        # Normalize history
        if history is None:
            history = []
        
        # Execute neural processing in threadpool
        def _orchestrate_widget():
            try:
                # Instanciar Core
                neural = NeuralCore(api_key=self.api_key)
                
                # Preparar datos
                system_prompt = PromptManager.get_system_prompt(client_id)
                
                # Generar respuesta con o sin historial
                if history and len(history) > 0:
                    # Patrón con historial: formatear contexto completo
                    full_context = NeuralCore.format_history_as_context(history, system_prompt)
                    response_text = neural.generate_stateless(
                        context_prompt=full_context,
                        user_message=message
                    )
                else:
                    # Patrón simple stateless (sin historial)
                    response_text = neural.generate_stateless(
                        user_input=message,
                        system_instruction=system_prompt
                    )
                
                return response_text
                
            except ValueError as e:
                return f"Lo siento, el sistema no está disponible: {str(e)}"
            except Exception as e:
                return f"Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo. ({str(e)})"
        
        return await run_in_threadpool(_orchestrate_widget)


# Singleton instance factory
_ai_service_instance: Optional[AIService] = None


def get_ai_service() -> AIService:
    """
    Get or create the singleton AI Service instance.
    
    This factory function ensures we have a single instance of AIService
    that can be reused across requests. The API key is read from environment
    on first access.
    
    Returns:
        The singleton AIService instance
        
    Raises:
        ValueError: If GOOGLE_API_KEY is not set
    """
    global _ai_service_instance
    
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    
    return _ai_service_instance

