from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.user import User

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

