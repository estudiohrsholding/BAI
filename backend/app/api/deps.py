from typing import Callable, Dict, Any, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import SECRET_KEY, ALGORITHM
from app.core.exceptions import FeatureForbiddenError
from app.models.user import (
  User,
  PlanTier,
  PLAN_FEATURE_MATRIX,
)

# OAuth2 password bearer token URL
reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


async def get_current_user(
  token: str = Depends(reusable_oauth2),
  session: Session = Depends(get_session)
) -> User:
  """
  Dependency to get the current authenticated user from JWT token.
  
  Args:
    token: JWT token from Authorization header
    session: Database session
    
  Returns:
    User object if token is valid
    
  Raises:
    HTTPException 401 if token is invalid or user not found
  """
  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
  )
  
  try:
    # Decode JWT token
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    email: str = payload.get("sub")
    
    if email is None:
      raise credentials_exception
      
  except JWTError:
    raise credentials_exception
  
  # Query database for user by email
  statement = select(User).where(User.email == email)
  user = session.exec(statement).first()
  
  if user is None:
    raise credentials_exception
    
  # Check if user is active
  if not user.is_active:
    raise HTTPException(
      status_code=status.HTTP_403_FORBIDDEN,
      detail="Inactive user"
    )
  
  # Ensure role is set (backward compatibility for legacy users)
  if not hasattr(user, 'role') or user.role is None or user.role == '':
    user.role = "client"
    session.add(user)
    session.commit()
    session.refresh(user)
  
  return user


PLAN_PRIORITY = [PlanTier.MOTOR, PlanTier.CEREBRO, PlanTier.PARTNER]


def _merge_features(user: User) -> Dict[str, Any]:
  base_features = PLAN_FEATURE_MATRIX.get(user.plan_tier, {})
  if user.features:
    return {**base_features, **user.features}
  return base_features


def get_current_plan_features(user: User = Depends(get_current_user)) -> Dict[str, Any]:
  """
  Dependency that returns the effective feature flags for the authenticated user.
  """
  return _merge_features(user)


def _find_required_plan_for_feature(feature_key: str) -> Optional[PlanTier]:
  for plan in PLAN_PRIORITY:
    if PLAN_FEATURE_MATRIX.get(plan, {}).get(feature_key):
      return plan
  return None


def requires_feature(feature_key: str) -> Callable:
  """
  Dependency factory that ensures the current user's plan exposes a given feature.
  """
  async def _dependency(
    user: User = Depends(get_current_user),
  ) -> User:
    features = _merge_features(user)
    if not features.get(feature_key, False):
      required_plan = _find_required_plan_for_feature(feature_key)
      required_label = required_plan.value if required_plan else "CEREBRO"
      raise FeatureForbiddenError(
        feature=feature_key,
        required_plan=required_label,
      )
    return user
  return _dependency


def requires_plan(min_plan: PlanTier) -> Callable:
  """
  Dependency factory that enforces a minimum subscription tier.
  """
  async def _dependency(
    user: User = Depends(get_current_user),
  ) -> User:
    if PLAN_PRIORITY.index(user.plan_tier) < PLAN_PRIORITY.index(min_plan):
      raise FeatureForbiddenError(
        feature="plan_access",
        required_plan=min_plan.value,
      )
    return user
  return _dependency

