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
  # This ensures backward compatibility with existing users
  with Session(engine) as session:
    try:
      from sqlalchemy import text, inspect
      
      # Check if role column exists in the users table
      inspector = inspect(engine)
      columns = [col['name'] for col in inspector.get_columns('users')]
      
      if 'role' in columns:
        # Column exists - update NULL/empty values using SQL for efficiency
        try:
          session.exec(
            text("UPDATE users SET role = 'client' WHERE role IS NULL OR role = ''")
          )
          session.commit()
        except Exception:
          session.rollback()
      
      # Also update via ORM for safety (handles any edge cases)
      try:
        statement = select(User)
        users = session.exec(statement).all()
        
        for user in users:
          # Ensure role is always set to a valid value
          if not hasattr(user, 'role') or user.role is None or user.role == '':
            user.role = "client"
            session.add(user)
        
        session.commit()
      except Exception:
        session.rollback()
        # If there's an error, continue - the column will be handled in authenticate_user
        pass
        
    except Exception:
      # If there's any other error, continue - the app should still work
      # The authenticate_user function will handle missing roles
      try:
        session.rollback()
      except:
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
