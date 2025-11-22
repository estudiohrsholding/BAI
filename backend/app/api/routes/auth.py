from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from app.api.deps import get_current_user
from app.core.database import get_session
from app.core.security import (
  verify_password,
  get_password_hash,
  create_access_token,
  ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.models.user import User

router = APIRouter()


# Pydantic models for requests/responses
class UserRegister(BaseModel):
  email: EmailStr
  password: str
  full_name: str | None = None


class UserResponse(BaseModel):
  id: int
  email: str
  full_name: str | None
  plan_tier: str
  is_active: bool
  
  class Config:
    from_attributes = True


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
    
  return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
  user_data: UserRegister,
  session: Session = Depends(get_session)
) -> UserResponse:
  """
  Register a new user.
  
  Args:
    user_data: User registration data (email, password, full_name)
    session: Database session
    
  Returns:
    Created user object (without password)
    
  Raises:
    HTTPException 400 if email already exists
  """
  # Check if email already exists
  statement = select(User).where(User.email == user_data.email)
  existing_user = session.exec(statement).first()
  
  if existing_user:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Email already registered"
    )
  
  # Hash password
  hashed_password = get_password_hash(user_data.password)
  
  # Create new user
  new_user = User(
    email=user_data.email,
    hashed_password=hashed_password,
    full_name=user_data.full_name,
    plan_tier="basic",
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

