from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.user import User
from app.services.stripe_service import create_checkout_session

router = APIRouter()


# Pydantic model for plan upgrade request
class PlanUpdate(BaseModel):
  plan: Literal["basic", "premium", "enterprise"]


# Pydantic model for checkout session creation
class CheckoutRequest(BaseModel):
  price_id: str


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
    # Merge current_user into this session to avoid session binding issues
    # This ensures the user object is attached to the current session
    user_in_session = session.merge(current_user)
    
    # Update user's plan tier
    user_in_session.plan_tier = plan_update.plan
    
    # Save changes to database
    session.commit()
    session.refresh(user_in_session)
    
    return {
      "status": "success",
      "new_tier": user_in_session.plan_tier
    }
    
  except Exception as e:
    session.rollback()
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Failed to update plan: {str(e)}"
    )


@router.post("/create-checkout")
async def create_stripe_checkout(
  checkout_request: CheckoutRequest,
  current_user: User = Depends(get_current_user)
) -> dict[str, str]:
  """
  Create a Stripe Checkout Session for subscription.
  
  Creates a Stripe checkout session and returns the URL for redirecting the user.
  The session includes the user's ID as client_reference_id for webhook tracking.
  
  Args:
    checkout_request: Request body with price_id (Stripe Price ID)
    current_user: Current authenticated user (from dependency)
    
  Returns:
    Dictionary with checkout URL: { "url": "https://checkout.stripe.com/..." }
    
  Raises:
    HTTPException 400 if price_id is invalid or missing
    HTTPException 500 if Stripe API call fails or STRIPE_API_KEY is not configured
  """
  try:
    # Validate price_id is provided
    if not checkout_request.price_id or not checkout_request.price_id.strip():
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="price_id is required"
      )
    
    # Create checkout session using Stripe service
    checkout_url = create_checkout_session(
      user_id=current_user.id,
      price_id=checkout_request.price_id
    )
    
    return {"url": checkout_url}
    
  except ValueError as e:
    # Stripe API key not configured or other validation error
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=str(e)
    )
  except Exception as e:
    # Stripe API errors or other unexpected errors
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"Failed to create checkout session: {str(e)}"
    )

