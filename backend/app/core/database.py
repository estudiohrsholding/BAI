import os
from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Create engine from DATABASE_URL
database_url = os.environ.get("DATABASE_URL", settings.DATABASE_URL)
engine = create_engine(database_url, echo=True)

# Export engine for thread-safe session creation
__all__ = ["engine", "create_db_and_tables", "get_session"]


def create_db_and_tables():
  """
  Create all database tables defined in SQLModel models.
  Call this on application startup.
  """
  SQLModel.metadata.create_all(engine)


def get_session():
  """
  Generator function that yields a database session.
  To be used as a FastAPI dependency.

  Usage:
    @app.get("/example")
    def example(session: Session = Depends(get_session)):
        # Use session here
        pass
  """
  with Session(engine) as session:
    yield session
