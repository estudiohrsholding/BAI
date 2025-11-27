"""
Chat Repository - Capa de Acceso a Datos

Este repositorio encapsula toda la lógica de acceso a datos del módulo Chat.
Sigue el patrón Repository para desacoplar la lógica de negocio de la persistencia.

Principio: Separation of Concerns
- El servicio no conoce detalles de SQLModel
- El repositorio puede cambiar de implementación (SQL → NoSQL) sin afectar el servicio
"""

from typing import List, Optional
from sqlmodel import Session, select
from datetime import datetime, timezone

from app.modules.chat.models import ChatMessage
# BaseModel se importa desde infrastructure.db.base


class ChatRepository:
    """
    Repositorio para operaciones de datos del módulo Chat.
    
    Encapsula todas las consultas a la base de datos relacionadas con mensajes de chat.
    """
    
    def __init__(self, session: Session):
        """
        Inicializa el repositorio con una sesión de base de datos.
        
        Args:
            session: Sesión de SQLModel
        """
        self.session = session
    
    def save_conversation_pair(
        self,
        user_id: int,
        user_message: str,
        ai_response: str
    ) -> None:
        """
        Guarda un par de mensajes (usuario + IA) en una transacción atómica.
        
        Si falla el guardado de la respuesta de IA, se revierte también el mensaje del usuario.
        
        Args:
            user_id: ID del usuario
            user_message: Mensaje del usuario
            ai_response: Respuesta de la IA
        
        Raises:
            Exception: Si falla la transacción
        """
        try:
            # Mensaje del usuario
            user_msg = ChatMessage(
                user_id=user_id,
                role="user",
                content=user_message,
                timestamp=datetime.now(timezone.utc)
            )
            self.session.add(user_msg)
            self.session.flush()  # Para obtener el ID si es necesario
            
            # Respuesta de la IA
            ai_msg = ChatMessage(
                user_id=user_id,
                role="bai",
                content=ai_response,
                timestamp=datetime.now(timezone.utc)
            )
            self.session.add(ai_msg)
            
            # Commit atómico (ambos o ninguno)
            self.session.commit()
            self.session.refresh(user_msg)
            self.session.refresh(ai_msg)
            
        except Exception as e:
            self.session.rollback()
            raise
    
    def get_recent_messages(
        self,
        user_id: int,
        limit: int = 10
    ) -> List[ChatMessage]:
        """
        Obtiene los mensajes más recientes de un usuario.
        
        Compatible con MemoryService.get_formatted_history():
        - Obtiene mensajes más recientes primero (desc)
        - Los retorna en orden cronológico (asc) para el motor de IA
        
        Args:
            user_id: ID del usuario
            limit: Número máximo de mensajes
        
        Returns:
            List[ChatMessage]: Lista de mensajes ordenados por timestamp (ascendente)
        """
        # Fetch messages (most recent first)
        statement = (
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.timestamp.desc())
            .limit(limit)
        )
        history_messages = self.session.exec(statement).all()
        
        # Reverse to chronological order (oldest first) for AI engine
        return list(reversed(history_messages))
    
    def get_all_messages(
        self,
        user_id: int
    ) -> List[ChatMessage]:
        """
        Obtiene todos los mensajes de un usuario.
        
        Args:
            user_id: ID del usuario
        
        Returns:
            List[ChatMessage]: Lista completa de mensajes ordenados por timestamp
        """
        statement = (
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.timestamp.asc())
        )
        
        result = self.session.exec(statement)
        return list(result.all())
    
    def delete_user_messages(
        self,
        user_id: int
    ) -> int:
        """
        Elimina todos los mensajes de un usuario.
        
        Args:
            user_id: ID del usuario
        
        Returns:
            int: Número de mensajes eliminados
        """
        statement = (
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
        )
        
        messages = self.session.exec(statement).all()
        count = len(messages)
        
        for msg in messages:
            self.session.delete(msg)
        
        self.session.commit()
        return count

