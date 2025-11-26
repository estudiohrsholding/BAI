"""
Memory Service

Manages chat history retrieval and formatting for neural processing.
Separates database queries from neural engine logic.
"""

from typing import List, Dict, Any, Optional, Tuple
from sqlmodel import Session, select
from app.models.chat import ChatMessage
from app.core.database import engine


class MemoryService:
    """Manages chat history and memory operations."""
    
    DEFAULT_HISTORY_LIMIT = 10
    
    @classmethod
    def get_formatted_history(
        cls, 
        user_id: int, 
        limit: int = DEFAULT_HISTORY_LIMIT,
        session: Optional[Session] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve and format chat history for Gemini API.
        
        Args:
            user_id: The user ID to retrieve history for
            limit: Maximum number of messages to retrieve (default: 10)
            session: Database session (if None, creates a new one)
            
        Returns:
            List of formatted messages in Gemini history format:
            [{"role": "user"|"model", "parts": [content]}]
        """
        # Use provided session or create a new one
        if session is None:
            with Session(engine) as new_session:
                return cls._fetch_and_format(new_session, user_id, limit)
        else:
            return cls._fetch_and_format(session, user_id, limit)
    
    @classmethod
    def _fetch_and_format(
        cls, 
        session: Session, 
        user_id: int, 
        limit: int
    ) -> List[Dict[str, Any]]:
        """Internal method to fetch and format history."""
        # Fetch messages (most recent first)
        statement = (
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.timestamp.desc())
            .limit(limit)
        )
        history_messages = session.exec(statement).all()
        
        # Reverse to chronological order (oldest first) for Gemini
        history_messages = list(reversed(history_messages))
        
        # Format for Gemini
        formatted_history = []
        for msg in history_messages:
            # DB role "user" -> Gemini role "user"
            # DB role "bai" -> Gemini role "model"
            gemini_role = "user" if msg.role == "user" else "model"
            formatted_history.append({
                "role": gemini_role,
                "parts": [msg.content]
            })
        
        return formatted_history
    
    @classmethod
    def save_message(
        cls,
        session: Session,
        role: str,
        content: str,
        user_id: int,
        commit: bool = True
    ) -> ChatMessage:
        """
        Save a chat message to the database.
        
        Args:
            session: Database session
            role: Message role ("user" or "bai")
            content: Message content
            user_id: User ID
            commit: Whether to commit immediately (default: True)
                    Set to False if saving multiple messages in one transaction
            
        Returns:
            Created ChatMessage instance
        """
        message = ChatMessage(role=role, content=content, user_id=user_id)
        session.add(message)
        if commit:
            session.commit()
        return message
    
    @classmethod
    def save_conversation_pair(
        cls,
        session: Session,
        user_message: str,
        ai_response: str,
        user_id: int
    ) -> Tuple[ChatMessage, ChatMessage]:
        """
        Save a conversation pair (user message + AI response) atomically.
        
        Both messages are saved in a single transaction. If either fails,
        the entire transaction is rolled back.
        
        Args:
            session: Database session
            user_message: User's message content
            ai_response: AI's response content
            user_id: User ID
            
        Returns:
            Tuple of (user_message_obj, ai_message_obj)
            
        Raises:
            Exception: If save fails, transaction is rolled back
        """
        try:
            # Save user message (without commit)
            user_msg = cls.save_message(
                session=session,
                role="user",
                content=user_message,
                user_id=user_id,
                commit=False
            )
            
            # Save AI response (without commit)
            ai_msg = cls.save_message(
                session=session,
                role="bai",
                content=ai_response,
                user_id=user_id,
                commit=False
            )
            
            # Commit both messages atomically
            session.commit()
            
            return user_msg, ai_msg
            
        except Exception as e:
            # Rollback on any error
            session.rollback()
            raise

