import os
from sqlmodel import SQLModel, create_engine, Session, select
from app.core.config import settings
from app.models.user import User

# Create engine from DATABASE_URL
database_url = os.environ.get("DATABASE_URL", settings.DATABASE_URL)
engine = create_engine(database_url, echo=True)

# Export engine for thread-safe session creation
__all__ = ["engine", "create_db_and_tables", "get_session"]


def create_db_and_tables():
  """
  Create all database tables defined in SQLModel models.
  Migrate existing users to have 'client' role by default.
  Call this on application startup.
  """
  SQLModel.metadata.create_all(engine)
  
  # Migration: Update existing users without role to 'client'
  with Session(engine) as session:
    # Check if role column exists by trying to select users
    try:
      statement = select(User)
      users = session.exec(statement).all()
      
      # Update users that don't have role set (None or empty)
      for user in users:
        if not hasattr(user, 'role') or user.role is None or user.role == '':
          user.role = "client"
          session.add(user)
      
      session.commit()
    except Exception:
      # If there's an error (e.g., column doesn't exist yet), just pass
      # SQLModel will create the column in the next step
      pass


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
