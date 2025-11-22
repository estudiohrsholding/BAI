from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.log import SearchLog
from app.models.user import User

router = APIRouter()


@router.get("/logs")
async def get_search_logs(
  current_user: User = Depends(get_current_user),
  session: Session = Depends(get_session)
) -> list[dict]:
  """
  Get search logs for Data Mining activities.
  
  Returns the last 20 search logs for the current user, ordered by timestamp (newest first).
  Protected by authentication - requires a valid Bearer token.
  
  Args:
    current_user: Current authenticated user (from dependency)
    session: Database session
    
  Returns:
    List of search log dictionaries (filtered by current_user.id)
  """
  statement = (
    select(SearchLog)
    .where(SearchLog.user_id == current_user.id)
    .order_by(SearchLog.timestamp.desc())
    .limit(20)
  )
  logs = session.exec(statement).all()
  
  return [
    {
      "id": log.id,
      "query": log.query,
      "summary": log.summary,
      "timestamp": log.timestamp.isoformat() if log.timestamp else None,
      "status": log.status
    }
    for log in logs
  ]

