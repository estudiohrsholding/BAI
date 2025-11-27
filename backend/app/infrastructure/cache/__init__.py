"""
Cache Infrastructure

Proporciona servicios de cache usando Redis.
"""

from app.infrastructure.cache.redis import CacheService, get_redis_client, close_redis

__all__ = [
    "CacheService",
    "get_redis_client",
    "close_redis",
]

