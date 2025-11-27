"""
Database Session Factory

Proporciona la factory para crear sesiones de base de datos SQLModel.
Preparado para soportar read-replicas y sharding en el futuro.
"""

from sqlmodel import Session, create_engine, SQLModel
from contextlib import contextmanager
from typing import Generator
import os

from app.core.config import settings


# ============================================
# DATABASE ENGINE
# ============================================

# Engine principal (write)
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL queries en desarrollo
    pool_pre_ping=True,  # Verificar conexiones antes de usar
    pool_size=10,  # Tamaño del pool de conexiones
    max_overflow=20,  # Conexiones adicionales permitidas
)

# TODO: Read replica para queries de solo lectura
# read_engine = create_engine(
#     settings.DATABASE_READ_URL,
#     echo=settings.DEBUG,
#     pool_pre_ping=True,
# )


# ============================================
# SESSION FACTORY
# ============================================

@contextmanager
def get_session() -> Generator[Session, None, None]:
    """
    Context manager para obtener una sesión de base de datos.
    
    Uso:
        with get_session() as session:
            # usar session
            session.commit()
    
    Yields:
        Session: Sesión de SQLModel
    
    Raises:
        Exception: Si falla la conexión
    """
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db_session() -> Session:
    """
    Dependency function para FastAPI.
    
    Returns:
        Session: Sesión de base de datos
    """
    return Session(engine)


# ============================================
# DATABASE INITIALIZATION
# ============================================

def init_db():
    """
    Inicializa la base de datos creando todas las tablas.
    
    En producción, usar Alembic migrations en su lugar.
    """
    SQLModel.metadata.create_all(engine)


def get_read_session() -> Session:
    """
    Obtiene una sesión de read replica (futuro).
    
    Returns:
        Session: Sesión de read replica
    """
    # TODO: Implementar cuando se configure read replica
    return Session(engine)  # Por ahora, usar engine principal

