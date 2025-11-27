from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.deps import requires_feature
from app.core.database import get_session
from app.models.log import SearchLog
from app.models.user import User
from app.models.mining import MiningReport
from app.services.mining_report import generate_mining_report

router = APIRouter()


class MiningReportRequest(BaseModel):
    topic: str | None = None  # Opcional: si no se proporciona, se extrae del historial


@router.get("/logs")
async def get_search_logs(
  current_user: User = Depends(requires_feature("access_mining")),
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


@router.post("/mining-report", response_model=MiningReport)
async def create_mining_report(
  request: MiningReportRequest,
  current_user: User = Depends(requires_feature("access_mining")),
  session: Session = Depends(get_session)
) -> MiningReport:
  """
  Genera un reporte completo de Data Mining usando Gemini y Brave Search API.
  
  El reporte se genera basándose en:
  - El historial de chat reciente del usuario (para extraer contexto)
  - Búsquedas en Brave Search API sobre el tema
  - Análisis con Gemini para estructurar los datos
  
  Returns:
    MiningReport con todos los datos estructurados para los gráficos del frontend
  """
  report = await generate_mining_report(
    session=session,
    user_id=current_user.id,
    topic=request.topic
  )
  return report

