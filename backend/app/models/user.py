from enum import Enum
from typing import Optional, Dict, Any

from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel, Column


class PlanTier(str, Enum):
  MOTOR = "MOTOR"
  CEREBRO = "CEREBRO"
  PARTNER = "PARTNER"


class SubscriptionStatus(str, Enum):
  ACTIVE = "active"
  PAST_DUE = "past_due"
  CANCELED = "canceled"


PLAN_FEATURE_MATRIX: Dict[PlanTier, Dict[str, Any]] = {
  PlanTier.MOTOR: {
    "access_mining": False,
    "access_marketing": False,
    "ai_content_generation": False,
    "max_chats": 1_000,
  },
  PlanTier.CEREBRO: {
    "access_mining": True,
    "access_marketing": True,
    "ai_content_generation": True,
    "max_chats": 10_000,
  },
  PlanTier.PARTNER: {
    "access_mining": True,
    "access_marketing": True,
    "ai_content_generation": True,
    "max_chats": 100_000,
    "dedicated_csm": True,
  },
}


class User(SQLModel, table=True):
  """
  User model extended with subscription metadata for the Tiered PaaS.
  """

  id: Optional[int] = Field(default=None, primary_key=True)
  email: str = Field(unique=True, index=True, max_length=255)
  hashed_password: str = Field(max_length=255)
  full_name: Optional[str] = Field(default=None, max_length=255)

  plan_tier: PlanTier = Field(
    default=PlanTier.MOTOR,
    sa_column=Column(SAEnum(PlanTier, name="plan_tier"))
  )
  subscription_status: SubscriptionStatus = Field(
    default=SubscriptionStatus.ACTIVE,
    sa_column=Column(SAEnum(SubscriptionStatus, name="subscription_status"))
  )
  stripe_customer_id: Optional[str] = Field(default=None, max_length=255)
  features: Optional[Dict[str, Any]] = Field(
    default=None,
    sa_column=Column(JSONB, nullable=True)
  )

  role: Optional[str] = Field(default="client", max_length=50)
  is_active: bool = Field(default=True)

