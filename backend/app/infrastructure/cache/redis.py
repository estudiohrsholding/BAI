"""
Redis Cache Service

Servicio de cache usando Redis para:
- Rate limiting
- Session storage
- Cache de respuestas frecuentes
- Task queue (Arq)

Migrado y mejorado para usar configuración centralizada desde core/config.py
"""

from typing import Optional, Any
import redis.asyncio as redis
import json
from functools import wraps

from app.core.config import settings


class CacheService:
    """
    Servicio de cache usando Redis.
    
    Proporciona métodos de alto nivel para operaciones de cache.
    """
    
    def __init__(self, redis_client: redis.Redis):
        """
        Inicializa el servicio de cache.
        
        Args:
            redis_client: Cliente de Redis (async)
        """
        self.redis = redis_client
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Obtiene un valor del cache.
        
        Args:
            key: Clave del cache
        
        Returns:
            Valor deserializado o None si no existe
        """
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception:
            return None
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: int = 3600  # 1 hora por defecto
    ) -> bool:
        """
        Guarda un valor en el cache.
        
        Args:
            key: Clave del cache
            value: Valor a guardar (será serializado a JSON)
            ttl: Time to live en segundos
        
        Returns:
            bool: True si se guardó exitosamente
        """
        try:
            serialized = json.dumps(value)
            await self.redis.setex(key, ttl, serialized)
            return True
        except Exception:
            return False
    
    async def delete(self, key: str) -> bool:
        """
        Elimina una clave del cache.
        
        Args:
            key: Clave a eliminar
        
        Returns:
            bool: True si se eliminó exitosamente
        """
        try:
            await self.redis.delete(key)
            return True
        except Exception:
            return False
    
    async def invalidate(self, pattern: str) -> int:
        """
        Invalida todas las claves que coincidan con un patrón.
        
        Args:
            pattern: Patrón de claves (ej: "chat_history:*")
        
        Returns:
            int: Número de claves eliminadas
        """
        try:
            keys = []
            async for key in self.redis.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                return await self.redis.delete(*keys)
            return 0
        except Exception:
            return 0
    
    async def exists(self, key: str) -> bool:
        """
        Verifica si una clave existe en el cache.
        
        Args:
            key: Clave a verificar
        
        Returns:
            bool: True si existe
        """
        try:
            return await self.redis.exists(key) > 0
        except Exception:
            return False


# ============================================
# REDIS CLIENT FACTORY
# ============================================

_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> redis.Redis:
    """
    Obtiene el cliente de Redis (singleton).
    
    Lee la configuración desde core.config.settings para mantener consistencia.
    
    Returns:
        redis.Redis: Cliente de Redis async
    
    Raises:
        ValueError: Si la URL de Redis no es válida
    """
    global _redis_client
    
    if _redis_client is None:
        # Usar configuración centralizada desde core/config.py
        redis_url = settings.REDIS_URL
        
        _redis_client = redis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True
        )
    
    return _redis_client


async def close_redis():
    """Cierra la conexión de Redis (para shutdown)"""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None

