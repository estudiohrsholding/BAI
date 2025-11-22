from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.user import User

router = APIRouter()


# Pydantic model for plan upgrade request
class PlanUpdate(BaseModel):
  plan: Literal["basic", "premium", "enterprise"]


@router.post("/upgrade")
async def upgrade_plan(
  plan_update: PlanUpdate,
  current_user: User = Depends(get_current_user),
  session: Session = Depends(get_session)
) -> dict[str, str]:
  """
  Upgrade user's subscription plan.
  
  Simulates a payment success and updates the user's plan_tier.
  Requires authentication.
  
  Args:
    plan_update: Request body with the new plan tier
    current_user: Authenticated user (from dependency)
    session: Database session
    
  Returns:
    Success response with new tier
    
  Raises:
    HTTPException 400 if plan is invalid
    HTTPException 500 if database update fails
  """
  try:
    # Update user's plan tier
    current_user.plan_tier = plan_update.plan
    
    # Save changes to database
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {
      "status": "success",
      "new_tier": current_user.plan_tier
    }
    
  except Exception as e:
    session.rollback()
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Failed to update plan: {str(e)}"
    )

