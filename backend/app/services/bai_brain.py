"""
B.A.I. Brain - Legacy Orchestrator (DEPRECATED)

This module is kept for backward compatibility but now delegates to AIService.
New code should use app.services.ai_service.AIService directly.

DEPRECATION NOTICE:
- Use AIService.generate_bai_response() instead of get_bai_response()
- Use AIService.generate_widget_response() instead of get_widget_response()
"""

from sqlmodel import Session
from app.services.ai_service import get_ai_service


async def get_bai_response(user_input: str, session: Session, user_id: int) -> str:
    """
    ORQUESTADOR INTERNO (B.A.I. Chatbot) - LEGACY WRAPPER
    
    DEPRECATED: Use AIService.generate_bai_response() directly.
    This function is kept for backward compatibility.
    
    Args:
        user_input: The user's message/query
        session: Database session for persisting chat history
        user_id: The ID of the user making the request (for data isolation)
        
    Returns:
        The AI-generated response string
    """
    ai_service = get_ai_service()
    return await ai_service.generate_bai_response(
        user_input=user_input,
        session=session,
        user_id=user_id
    )


async def get_widget_response(message: str, client_id: str, history: list = None) -> str:
    """
    ORQUESTADOR WIDGET (Chatbot Externo) - LEGACY WRAPPER
    
    DEPRECATED: Use AIService.generate_widget_response() directly.
    This function is kept for backward compatibility.
    
    Args:
        message: The user's message/query
        client_id: The client identifier (e.g., 'inmo-test-001') to determine persona
        history: Optional conversation history list from frontend (default: empty list)
        
    Returns:
        The AI-generated response string
    """
    ai_service = get_ai_service()
    return await ai_service.generate_widget_response(
        message=message,
        client_id=client_id,
        history=history
    )
