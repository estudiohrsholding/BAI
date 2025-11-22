from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing context (using bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Default token expiration time


def verify_password(plain_password: str, hashed_password: str) -> bool:
  """
  Verify a plain password against a hashed password.
  
  Args:
    plain_password: The plain text password to verify
    hashed_password: The bcrypt hashed password from database
    
  Returns:
    True if password matches, False otherwise
  """
  return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
  """
  Hash a password using bcrypt.
  
  Args:
    password: The plain text password to hash
    
  Returns:
    The bcrypt hashed password
  """
  return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
  """
  Create a JWT access token.
  
  Args:
    data: Dictionary containing the data to encode (typically {"sub": user_id})
    expires_delta: Optional expiration time delta. If not provided, uses default ACCESS_TOKEN_EXPIRE_MINUTES
    
  Returns:
    Encoded JWT token string
  """
  to_encode = data.copy()
  
  # Use timezone-aware datetime (UTC) for accurate timestamp conversion
  if expires_delta:
    expire = datetime.now(timezone.utc) + expires_delta
  else:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  
  # Convert datetime to Unix timestamp (seconds since epoch) as required by JWT RFC 7519
  # NumericDate must be an integer representing seconds since 1970-01-01T00:00:00Z UTC
  expire_timestamp = int(expire.timestamp())
  to_encode.update({"exp": expire_timestamp})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  
  return encoded_jwt

