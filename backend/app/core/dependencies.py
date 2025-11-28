"""
Dependency Injection Container

Este módulo centraliza todas las dependencias de la aplicación usando
FastAPI's Dependency Injection system. Permite inyectar servicios,
repositorios y configuraciones de forma limpia y testeable.

Principio: Dependency Inversion (DIP)
- Alto nivel depende de abstracciones
- Las dependencias se resuelven en tiempo de ejecución
"""

from functools import lru_cache
from typing import Annotated, TYPE_CHECKING
from fastapi import Depends, Request
from sqlmodel import Session

from app.infrastructure.db.session import get_session
from app.modules.chat.engine.interface import AIEngineProtocol
from app.modules.chat.engine.gemini import GeminiEngine
from app.modules.chat.repository import ChatRepository
from app.modules.chat.service import ChatService
from app.infrastructure.cache.redis import CacheService, get_redis_client


# ============================================
# DATABASE DEPENDENCIES
# ============================================

def get_db() -> Session:
    """
    Dependency para obtener una sesión de base de datos.
    
    Returns:
        Session: Sesión de SQLModel
    """
    from app.infrastructure.db.session import get_session
    return get_session()


# Type alias para cleaner annotations
DatabaseDep = Annotated[Session, Depends(get_db)]


# ============================================
# AI ENGINE DEPENDENCIES
# ============================================

@lru_cache()
def get_ai_engine() -> AIEngineProtocol:
    """
    Dependency para obtener el motor de IA.
    
    Usa lru_cache para singleton (una instancia por proceso).
    Puede cambiar de implementación según configuración.
    
    Returns:
        AIEngineProtocol: Motor de IA (Gemini, OpenAI, etc.)
    """
    # TODO: Leer de configuración para decidir qué motor usar
    # Por ahora, siempre Gemini
    return GeminiEngine()


# Type alias
AIEngineDep = Annotated[AIEngineProtocol, Depends(get_ai_engine)]


# ============================================
# CACHE DEPENDENCIES
# ============================================

def get_cache_service() -> CacheService:
    """
    Dependency para obtener el servicio de cache.
    
    Returns:
        CacheService: Servicio de Redis
    """
    redis_client = get_redis_client()
    return CacheService(redis_client)


# Type alias
CacheDep = Annotated[CacheService, Depends(get_cache_service)]


# ============================================
# REPOSITORY DEPENDENCIES
# ============================================

def get_chat_repository(
    session: DatabaseDep
) -> ChatRepository:
    """
    Dependency para obtener el repositorio de Chat.
    
    Args:
        session: Sesión de base de datos (inyectada)
    
    Returns:
        ChatRepository: Repositorio de Chat
    """
    return ChatRepository(session=session)


# Type alias
ChatRepositoryDep = Annotated[ChatRepository, Depends(get_chat_repository)]


# ============================================
# SERVICE DEPENDENCIES
# ============================================

def get_chat_service(
    ai_engine: AIEngineDep,
    repository: ChatRepositoryDep,
    cache: CacheDep
) -> ChatService:
    """
    Dependency para obtener el servicio de Chat.
    
    Todas las dependencias se inyectan automáticamente por FastAPI.
    
    Args:
        ai_engine: Motor de IA (inyectado)
        repository: Repositorio de Chat (inyectado)
        cache: Servicio de cache (inyectado)
    
    Returns:
        ChatService: Servicio de negocio de Chat
    """
    return ChatService(
        ai_engine=ai_engine,
        repository=repository,
        cache=cache
    )


# Type alias
ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]


# ============================================
# ARQ REDIS POOL DEPENDENCIES
# ============================================

def get_arq_pool(request: Request) -> "ArqRedis":
    """
    Dependency para obtener el pool de Arq Redis singleton.
    
    Este pool se inicializa una vez al startup de la aplicación (en main.py)
    y se reutiliza en todos los requests. NO crear nuevos pools.
    
    Args:
        request: Request de FastAPI (para acceder a app.state)
    
    Returns:
        ArqRedis: Pool de conexiones Redis para Arq
    
    Raises:
        HTTPException 500: Si el pool no está inicializado
    
    Example:
        @router.post("/endpoint")
        async def my_endpoint(
            arq_pool: ArqRedisDep,
            ...
        ):
            job = await arq_pool.enqueue_job("task_name", ...)
    """
    from fastapi import HTTPException, status
    
    pool = getattr(request.app.state, "arq_pool", None)
    if not pool:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Arq Redis pool no inicializado. Verifica el startup del backend."
        )
    return pool


# Type annotation with forward reference
if TYPE_CHECKING:
    from arq import ArqRedis

# Type alias
ArqRedisDep = Annotated["ArqRedis", Depends(get_arq_pool)]

