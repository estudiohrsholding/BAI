from typing import Optional
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
  """
  User model for authentication and authorization.
  
  Fields:
    id: Primary key
    email: Unique email address (indexed for fast lookups)
    hashed_password: Bcrypt hashed password
    full_name: Optional full name
    plan_tier: Subscription tier (basic, premium, enterprise)
    role: User role for RBAC (admin, client)
    is_active: Account status flag
  """
  id: Optional[int] = Field(default=None, primary_key=True)
  email: str = Field(unique=True, index=True, max_length=255)
  hashed_password: str = Field(max_length=255)
  full_name: Optional[str] = Field(default=None, max_length=255)
  plan_tier: str = Field(default="basic", max_length=50)
  role: Optional[str] = Field(default="client", max_length=50)  # Optional for backward compatibility
  is_active: bool = Field(default=True)

