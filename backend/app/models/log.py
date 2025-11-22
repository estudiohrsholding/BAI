from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class SearchLog(SQLModel, table=True):
  """
  SearchLog model for persisting Data Mining search activities.
  Stores search queries and their results for dashboard display.
  """
  
  id: Optional[int] = Field(default=None, primary_key=True)
  user_id: int = Field(foreign_key="user.id", index=True)  # Foreign key to User
  query: str = Field(max_length=500)
  summary: str = Field(max_length=2000)  # Short result snippet
  timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
  status: str = Field(default="completed", max_length=50)

