"""
B.A.I. Brain - Orchestrator

High-level orchestrator for neural processing.
Coordinates: Memory, Tools, Prompts, and Neural Core.
"""

import os
from fastapi.concurrency import run_in_threadpool
from sqlmodel import Session
from app.core.database import engine

from app.services.brain.prompts import PromptManager
from app.services.brain.tools import ToolExecutor
from app.services.brain.memory import MemoryService
from app.services.brain.core import NeuralCore, EmailCommandHandler


async def get_bai_response(user_input: str, session: Session, user_id: int) -> str:
    """
    ORQUESTADOR INTERNO (B.A.I. Chatbot)
    
    Generates a response from B.A.I. using Google Gemini API with chat history.
    Coordinates: Memory, Tools, Prompts, and Neural Core.
    
    Args:
        user_input: The user's message/query
        session: Database session for persisting chat history
        user_id: The ID of the user making the request (for data isolation)
        
    Returns:
        The AI-generated response string, or a fallback message if API key is missing
    """
    # 1. Validate API Key
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return "System Alert: API Key missing."
    
    # 2. Execute tools (n8n, Brave Search) - async (must be outside threadpool)
    tool_result = await ToolExecutor.detect_and_execute(
        user_input=user_input,
        user_id=user_id,
        session=session
    )
    
    # 3. Get system prompt
    system_prompt = PromptManager.get_bai_prompt(include_automation_protocol=True)
    
    # 4. Prepare context update from tool execution
    context_update = tool_result.context_update if tool_result.executed else None
    
    # 5. Execute neural processing in threadpool (Gemini API is blocking)
    def _orchestrate():
        # 1. Instanciar Core (necesita API key)
        neural = NeuralCore(api_key=api_key)
        
        with Session(engine) as thread_session:
            try:
                # 2. Recuperar Memoria (Historial formateado)
                history = MemoryService.get_formatted_history(
                    user_id=user_id,
                    limit=MemoryService.DEFAULT_HISTORY_LIMIT,
                    session=thread_session
                )
                
                # 3. Generar Respuesta Neuronal
                response_text = neural.generate_with_history(
                    user_input=user_input,
                    system_instruction=system_prompt,
                    history=history,
                    context_update=context_update
                )
                
                # 4. Procesar respuesta: extraer comando de email si existe
                cleaned_response, email = neural.process_response(response_text)
                
                # 5. Trigger email webhook si se encontró comando (fire and forget)
                if email:
                    EmailCommandHandler.trigger_email_webhook(email, cleaned_response)
                
                # 6. Guardar par de conversación atómicamente (ambos mensajes en una transacción)
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


async def get_widget_response(message: str, client_id: str, history: list = None) -> str:
    """
    ORQUESTADOR WIDGET (Chatbot Externo / Inmobiliaria)
    
    Generates a response for external widget chat (stateless, no authentication required).
    This function handles widget requests with custom personas based on client_id.
    Supports conversation history for context retention when provided by the frontend.
    
    Args:
        message: The user's message/query
        client_id: The client identifier (e.g., 'inmo-test-001') to determine persona
        history: Optional conversation history list from frontend (default: empty list)
        
    Returns:
        The AI-generated response string, or a fallback message if API key is missing
    """
    # 1. Validate API Key
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return "Lo siento, el sistema no está disponible en este momento. Por favor, intenta más tarde."
    
    # 2. Normalize history (ensure it's a list)
    if history is None:
        history = []
    
    # 3. Execute neural processing in threadpool
    def _orchestrate_widget():
        try:
            # 1. Instanciar Core
            neural = NeuralCore(api_key=api_key)
            
            # 2. Preparar datos
            system_prompt = PromptManager.get_system_prompt(client_id)
            
            # 3. Generar respuesta con o sin historial
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
