"""
Mining Routes - Endpoints protegidos para análisis avanzados
"""

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from typing import Optional

from app.api.deps import requires_feature
from app.core.database import get_session
from app.models.user import User
from app.services.mining_report import generate_mining_report
from sqlmodel import Session


class MiningAnalysisRequest(BaseModel):
    topic: Optional[str] = None


class MiningAnalysisResponse(BaseModel):
    detail: str


router = APIRouter(prefix="/api/v1/mining", tags=["mining"])


@router.post(
    "/run-analysis",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=MiningAnalysisResponse,
)
async def run_analysis(
    payload: MiningAnalysisRequest,
    current_user: User = Depends(requires_feature("access_mining")),
    session: Session = Depends(get_session),
) -> MiningAnalysisResponse:
    """
    Dispara un análisis de minería de datos avanzado.
    Requiere al menos el plan CEREBRO (feature `access_mining`).
    """
    await generate_mining_report(
        session=session,
        user_id=current_user.id,
        topic=payload.topic,
    )
    return MiningAnalysisResponse(
        detail="Análisis en progreso. Revisa tu dashboard cuando finalice."
    )

