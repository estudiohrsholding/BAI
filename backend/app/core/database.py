"""
Database Module - LEGACY WRAPPER

⚠️ DEPRECATED: Este módulo está deprecado en favor de app.infrastructure.db.session
pero se mantiene para compatibilidad hacia atrás.

Este módulo ahora delega a infrastructure/db/session.py que tiene:
- Mejor configuración de pool (pool_pre_ping, pool_size, max_overflow)
- Context manager con rollback automático
- Mejor manejo de errores

Nuevo código debe usar: from app.infrastructure.db.session import get_session
"""

import os
from sqlmodel import SQLModel, select
from app.core.config import settings
from app.models.user import User

# Importar engine del sistema nuevo (mejor configuración de pool)
from app.infrastructure.db.session import engine

# Re-exportar para compatibilidad
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
  from sqlmodel import Session
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
  
  ⚠️ DEPRECATED: Este es un wrapper para compatibilidad.
  Internamente usa app.infrastructure.db.session que tiene mejor configuración.
  
  Usage:
    @app.get("/example")
    def example(session: Session = Depends(get_session)):
        # Use session here
        pass
  """
  # Usar el engine unificado (mejor configuración de pool)
  # IMPORTANTE: NO usar 'with Session(engine) as session:' porque cierra la sesión
  # antes de que FastAPI pueda usarla. Crear manualmente y manejar el ciclo de vida.
  from sqlmodel import Session
  session = Session(engine)
  try:
    yield session
    session.commit()
  except Exception:
    session.rollback()
    raise
  finally:
    session.close()
