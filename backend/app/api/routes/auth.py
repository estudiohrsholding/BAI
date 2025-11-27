from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_session
from app.core.security import (
  verify_password,
  get_password_hash,
  create_access_token,
  ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.models.user import User, PlanTier, SubscriptionStatus

router = APIRouter()


# Pydantic models for requests/responses
class UserRegister(BaseModel):
  """
  User registration schema.
  
  Note: The 'role' field is NOT part of the input schema.
  Role assignment is handled internally based on admin_key validation.
  
  SECURITY WARNING: After creating your initial admin account, it is strongly
  recommended to remove the 'admin_key' field from this schema and the
  ADMIN_SECRET_CODE environment variable to permanently secure the registration endpoint.
  """
  email: EmailStr
  password: str
  full_name: str | None = None
  admin_key: str | None = None  # Optional: used to create admin account (see SECURITY WARNING above)


class UserResponse(BaseModel):
  id: int
  email: str
  full_name: str | None
  plan_tier: str
  role: str | None = "client"  # Optional with default for backward compatibility
  is_active: bool
  
  class Config:
    from_attributes = True
  
  @classmethod
  def model_validate(cls, obj, **kwargs):
    # Ensure role is always set (backward compatibility for legacy users)
    if hasattr(obj, 'role') and (obj.role is None or obj.role == ''):
      obj.role = "client"
    return super().model_validate(obj, **kwargs)


class Token(BaseModel):
  access_token: str
  token_type: str


# Helper function to authenticate user
def authenticate_user(session: Session, email: str, password: str) -> User | None:
  """
  Authenticate a user by email and password.
  
  Args:
    session: Database session
    email: User email
    password: Plain text password
    
  Returns:
    User object if credentials are valid, None otherwise
  """
  statement = select(User).where(User.email == email)
  user = session.exec(statement).first()
  
  if not user:
    return None
    
  if not verify_password(password, user.hashed_password):
    return None
    
  if not user.is_active:
    return None
  
  # Ensure role is set (backward compatibility for existing users)
  if not hasattr(user, 'role') or user.role is None or user.role == '':
    user.role = "client"
    session.add(user)
    session.commit()
    session.refresh(user)
    
  return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
  user_data: UserRegister,
  session: Session = Depends(get_session)
) -> UserResponse:
  """
  Register a new user with RBAC support.
  
  All public registrations default to 'client' role.
  Only users with valid admin_key (matching ADMIN_SECRET_CODE env var) can create 'admin' accounts.
  
  Args:
    user_data: User registration data (email, password, full_name, admin_key)
    session: Database session
    
  Returns:
    Created user object (without password, includes role)
    
  Raises:
    HTTPException 400 if email already exists
    HTTPException 403 if admin_key is invalid or ADMIN_SECRET_CODE is not configured
  """
  # Check if email already exists
  statement = select(User).where(User.email == user_data.email)
  existing_user = session.exec(statement).first()
  
  if existing_user:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Email already registered"
    )
  
  # Role assignment logic:
  # Default: All public registrations are assigned 'client' role
  # Admin bypass: If admin_key matches ADMIN_SECRET_CODE env var, assign 'admin' role
  user_role = "client"  # Default role for all public registrations
  
  if user_data.admin_key:
    # Verify admin key against environment variable
    if not settings.ADMIN_SECRET_CODE:
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin registration is not configured. Please contact support."
      )
    
    if user_data.admin_key != settings.ADMIN_SECRET_CODE:
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Invalid admin key"
      )
    
    # Valid admin key - assign admin role
    user_role = "admin"
  
  # Note: The 'role' field is NOT part of the UserRegister input schema.
  # It is assigned internally based on the admin_key validation above.
  
  # Hash password
  hashed_password = get_password_hash(user_data.password)
  
  # Create new user with assigned role
  new_user = User(
    email=user_data.email,
    hashed_password=hashed_password,
    full_name=user_data.full_name,
    plan_tier=PlanTier.MOTOR,  # Default plan for new users
    subscription_status=SubscriptionStatus.ACTIVE,
    role=user_role,
    is_active=True
  )
  
  session.add(new_user)
  session.commit()
  session.refresh(new_user)
  
  # Return user without password
  return UserResponse.model_validate(new_user)


@router.post("/token", response_model=Token)
async def login_for_access_token(
  form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
  session: Session = Depends(get_session)
) -> Token:
  """
  OAuth2 compatible token endpoint.
  
  Accepts form data with username (email) and password.
  Returns JWT access token.
  
  Args:
    form_data: OAuth2 password request form (username=email, password)
    session: Database session
    
  Returns:
    Access token and token type
    
  Raises:
    HTTPException 401 if credentials are invalid
  """
  # Authenticate user (form_data.username is the email in our case)
  user = authenticate_user(session, form_data.username, form_data.password)
  
  if not user:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Incorrect email or password",
      headers={"WWW-Authenticate": "Bearer"},
    )
  
  # Create access token
  access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  access_token = create_access_token(
    data={"sub": user.email},
    expires_delta=access_token_expires
  )
  
  return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def read_users_me(
  current_user: User = Depends(get_current_user)
) -> UserResponse:
  """
  Get current authenticated user profile.
  
  Args:
    current_user: Current authenticated user (from dependency)
    
  Returns:
    User profile (without password)
  """
  return UserResponse.model_validate(current_user)

