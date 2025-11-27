"""
AI Inference Tasks - Tareas de Inferencia de IA

Tareas para procesar inferencias de IA pesadas en background.
Útiles para reportes largos, análisis complejos, etc.
"""

from typing import Dict, Any, Optional, List
import logging

from app.modules.chat.engine.gemini import GeminiEngine
from app.infrastructure.db.session import get_session
from app.modules.chat.repository import ChatRepository
from app.modules.chat.service import ChatService


async def process_ai_inference(
    ctx: Dict[str, Any],
    message: str,
    user_id: int,
    client_id: Optional[str] = None,
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Procesa una inferencia de IA en background (tarea larga).
    
    Esta función se ejecuta en un worker separado, no bloquea el request HTTP.
    Útil para:
    - Generación de reportes largos
    - Análisis complejos que requieren múltiples llamadas a la IA
    - Procesamiento de documentos grandes
    
    Args:
        ctx: Contexto del worker (contiene Redis, logger, etc.)
        message: Mensaje del usuario
        user_id: ID del usuario
        client_id: ID del cliente (opcional, para widgets externos)
        history: Historial de conversación (opcional)
    
    Returns:
        Dict con la respuesta generada y metadata:
        {
            "response": str,
            "user_id": int,
            "status": "completed",
            "model": str,
            "provider": str
        }
    
    Raises:
        Exception: Si falla el procesamiento
    """
    logger = ctx.get("logger") or logging.getLogger("bai.worker.tasks")
    
    message_preview = message[:50] + "..." if len(message) > 50 else message
    logger.info(
        f"AI inference started - User: {user_id}, Client: {client_id}, Message: {message_preview}"
    )
    
    try:
        # Inicializar dependencias
        ai_engine = GeminiEngine()
        session = next(get_session())
        repository = ChatRepository(session=session)
        service = ChatService(
            ai_engine=ai_engine,
            repository=repository,
            cache=None  # Cache opcional en workers
        )
        
        # Procesar mensaje
        response = await service.process_message(
            user_id=user_id,
            message=message,
            session=session,
            client_id=client_id,
            context={"history": history} if history else None,
            is_bai_internal=(client_id is None)
        )
        
        result = {
            "response": response,
            "user_id": user_id,
            "status": "completed",
            "model": ai_engine.model_name,
            "provider": ai_engine.provider
        }
        
        logger.info(
            f"AI inference completed - User: {user_id}, Model: {ai_engine.model_name}, "
            f"Response length: {len(response)}"
        )
        
        return result
    
    except Exception as e:
        logger.error(
            f"AI inference failed - User: {user_id}, Error: {str(e)} ({type(e).__name__})"
        )
        
        return {
            "status": "failed",
            "user_id": user_id,
            "error": str(e),
            "error_type": type(e).__name__
        }

