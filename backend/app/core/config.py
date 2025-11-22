from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
  PROJECT_NAME: str = "B.A.I. Platform"
  VERSION: str = "0.1.0"
  GOOGLE_API_KEY: str | None = None
  DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@db:5432/bai"
  # SECRET_KEY must be set via environment variable - no insecure default
  SECRET_KEY: str
  
  # Stripe Configuration
  STRIPE_API_KEY: str | None = None
  STRIPE_WEBHOOK_SECRET: str | None = None
  DOMAIN: str = "https://baibussines.com"

  @field_validator("SECRET_KEY")
  @classmethod
  def validate_secret_key(cls, v: str) -> str:
    if not v or len(v) < 32:
      raise ValueError(
        "SECRET_KEY must be set and must be at least 32 characters long. "
        "Please set SECRET_KEY in your .env file or environment variables. "
        "Generate a secure key with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
      )
    # Check for common insecure default values
    insecure_defaults = [
      "your-secret-key-change-in-production",
      "secret",
      "changeme",
      "dev-secret-key"
    ]
    if v.lower() in insecure_defaults:
      raise ValueError(
        "SECRET_KEY cannot use an insecure default value. "
        "Please set a secure SECRET_KEY in your .env file or environment variables."
      )
    return v

  # This allows extra fields in .env without crashing
  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    case_sensitive=False,
    extra="ignore"
  )


settings = Settings()
