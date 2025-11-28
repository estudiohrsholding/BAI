"""
Chat Routes - Endpoints HTTP del Módulo Chat

Define los endpoints HTTP para el módulo Chat.
Solo maneja HTTP (request/response), delega la lógica a ChatService.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

from app.modules.chat.schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatHistoryResponse,
    WidgetChatRequest,
    ChatMessageItem
)
from app.modules.chat.service import ChatService
from app.core.dependencies import (
    ChatServiceDep,
    DatabaseDep,
    AIEngineDep,
    ArqRedisDep
)
from app.modules.chat.models import ChatMessage
from app.api.deps import requires_feature
from app.models.user import User


router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post(
    "/message",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Enviar mensaje de chat",
    description="Procesa un mensaje del usuario y genera una respuesta del motor de IA"
)
async def send_message(
    chat_request: ChatMessageRequest,
    arq_pool: ArqRedisDep,
    chat_service: ChatServiceDep,
    session: DatabaseDep,
    current_user: User = Depends(requires_feature("ai_content_generation")),
) -> ChatMessageResponse:
    """
    Endpoint para enviar un mensaje de chat (autenticado).
    
    Args:
        arq_pool: Pool de Redis para Arq (inyectado automáticamente)
        chat_request: Datos del mensaje
        chat_service: Servicio de chat (inyectado)
        session: Sesión de base de datos (inyectada)
        current_user: Usuario autenticado
    
    Returns:
        ChatMessageResponse: Respuesta del motor de IA
    
    Raises:
        HTTPException: Si el procesamiento falla
    """
    try:
        response_text = await chat_service.process_message(
            user_id=current_user.id,
            message=chat_request.text,
            session=session,
            client_id=chat_request.client_id,
            context=chat_request.context
        )
        
        # Trackear uso de AI content generation de forma asíncrona
        try:
            await arq_pool.enqueue_job(
                "track_feature_use",
                user_id=current_user.id,
                feature_key="ai_content_generation",
                tracking_metadata={
                    "model": chat_service.ai_engine.model_name,
                    "provider": chat_service.ai_engine.provider,
                    "message_length": len(chat_request.text),
                    "response_length": len(response_text)
                }
            )
        except Exception:
            # Si falla el tracking, no romper el flujo principal
            pass
        
        return ChatMessageResponse(
            response=response_text,
            metadata={
                "model": chat_service.ai_engine.model_name,
                "provider": chat_service.ai_engine.provider
            }
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando mensaje: {str(e)}"
        )


@router.get(
    "/history",
    response_model=ChatHistoryResponse,
    summary="Obtener historial de chat",
    description="Retorna el historial completo de conversación del usuario"
)
async def get_history(
    chat_service: ChatServiceDep,
    session: DatabaseDep,
    current_user: User = Depends(requires_feature("ai_content_generation")),
) -> ChatHistoryResponse:
    """
    Endpoint para obtener el historial de conversación.
    
    Args:
        chat_service: Servicio de chat (inyectado)
        session: Sesión de base de datos (inyectada)
        current_user_id: ID del usuario autenticado
    
    Returns:
        ChatHistoryResponse: Historial de mensajes
    """
    messages = chat_service.get_conversation_history(
        user_id=current_user.id,
        session=session
    )
    
    # Convertir a esquemas de respuesta
    message_items = [
        ChatMessageItem(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            timestamp=msg.timestamp
        )
        for msg in messages
    ]
    
    return ChatHistoryResponse(
        messages=message_items,
        total=len(message_items)
    )


@router.post(
    "/widget",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat para widgets externos (público)",
    description="Endpoint público para widgets embebidos en sitios de clientes"
)
async def widget_chat(
    request: WidgetChatRequest,
    ai_engine: AIEngineDep,
    session: DatabaseDep
) -> ChatMessageResponse:
    """
    Endpoint público para widgets externos.
    
    No requiere autenticación, pero usa client_id para personalización.
    
    Args:
        request: Datos del mensaje del widget
        ai_engine: Motor de IA (inyectado)
        session: Sesión de base de datos (inyectada)
    
    Returns:
        ChatMessageResponse: Respuesta del motor de IA
    """
    try:
        # Construir system instruction según client_id
        from app.modules.chat.service import ChatService
        from app.modules.chat.repository import ChatRepository
        
        repository = ChatRepository(session=session)
        service = ChatService(
            ai_engine=ai_engine,
            repository=repository,
            cache=None  # Cache opcional para widgets
        )
        
        # Procesar mensaje (sin user_id, es público)
        # TODO: Crear user_id temporal o usar client_id como identificador
        response_text = await service.process_message(
            user_id=0,  # Usuario anónimo
            message=request.message,
            session=session,
            client_id=request.client_id,
            context={"history": request.history} if request.history else None
        )
        
        return ChatMessageResponse(
            response=response_text,
            metadata={
                "model": ai_engine.model_name,
                "provider": ai_engine.provider
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando mensaje del widget: {str(e)}"
        )

