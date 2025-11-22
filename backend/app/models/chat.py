from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class ChatMessage(SQLModel, table=True):
  """
  ChatMessage model for persisting chat history.
  Stores both user messages and B.A.I. responses.
  """

  id: Optional[int] = Field(default=None, primary_key=True)
  user_id: int = Field(foreign_key="user.id", index=True)  # Foreign key to User (required)
  role: str  # "user" or "bai"
  content: str
  timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
