"""
Health Check Endpoint - Diagnóstico del Sistema

Endpoint robusto que verifica el estado de todos los servicios críticos:
- PostgreSQL (Database)
- Redis (Cache & Queue)
- Workers (Arq)
- AI Engine (Gemini)

Útil para monitoreo, alertas y verificación de despliegue.
"""

from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
from datetime import datetime
import asyncio

from app.infrastructure.db.session import engine
from app.infrastructure.cache.redis import get_redis_client
from app.modules.chat.engine.gemini import GeminiEngine
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["health"])


# ============================================
# RESPONSE SCHEMAS
# ============================================

class ServiceStatus:
    """Estado de un servicio individual"""
    
    def __init__(self, name: str, status: str, latency_ms: Optional[float] = None, error: Optional[str] = None):
        self.name = name
        self.status = status  # "up", "down", "degraded"
        self.latency_ms = latency_ms
        self.error = error
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte a diccionario para JSON"""
        result = {
            "name": self.name,
            "status": self.status
        }
        if self.latency_ms is not None:
            result["latency_ms"] = round(self.latency_ms, 2)
        if self.error:
            result["error"] = self.error
        return result


class SystemHealthResponse:
    """Respuesta completa del health check"""
    
    def __init__(
        self,
        status: str,
        timestamp: datetime,
        services: Dict[str, ServiceStatus],
        version: str = None
    ):
        self.status = status  # "healthy", "degraded", "unhealthy"
        self.timestamp = timestamp
        self.services = services
        self.version = version or settings.VERSION
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte a diccionario para JSON"""
        return {
            "status": self.status,
            "timestamp": self.timestamp.isoformat(),
            "version": self.version,
            "services": {
                name: service.to_dict()
                for name, service in self.services.items()
            }
        }


# ============================================
# HEALTH CHECK FUNCTIONS
# ============================================

async def check_database() -> ServiceStatus:
    """
    Verifica la conectividad y latencia de PostgreSQL.
    
    Returns:
        ServiceStatus: Estado de la base de datos
    """
    import time
    start = time.time()
    
    try:
        # Ejecutar query simple para verificar conectividad
        from sqlmodel import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        
        latency_ms = (time.time() - start) * 1000
        
        return ServiceStatus(
            name="database",
            status="up",
            latency_ms=latency_ms
        )
    
    except Exception as e:
        return ServiceStatus(
            name="database",
            status="down",
            error=str(e)
        )


async def check_redis() -> ServiceStatus:
    """
    Verifica la conectividad y latencia de Redis.
    
    Returns:
        ServiceStatus: Estado de Redis
    """
    start_time = asyncio.get_event_loop().time()
    
    try:
        redis_client = get_redis_client()
        await redis_client.ping()
        
        latency_ms = (asyncio.get_event_loop().time() - start_time) * 1000
        
        return ServiceStatus(
            name="redis",
            status="up",
            latency_ms=latency_ms
        )
    
    except Exception as e:
        return ServiceStatus(
            name="redis",
            status="down",
            error=str(e)
        )


async def check_worker_status() -> Dict[str, Any]:
    """
    Helper function para obtener el estado del worker.
    
    Returns:
        dict con status y queue_size
    """
    try:
        redis_client = get_redis_client()
        await redis_client.ping()
        
        # Intentar obtener tamaño de la cola
        try:
            queue_size = await redis_client.llen("arq:queue")
        except Exception:
            queue_size = 0
        
        return {
            "status": "healthy",
            "queue_size": queue_size
        }
    except Exception:
        return {
            "status": "down",
            "queue_size": 0
        }


async def check_worker() -> ServiceStatus:
    """
    Verifica el estado de los workers (Arq).
    
    Verifica:
    - Conectividad a Redis (requisito para workers)
    - Tamaño de la cola (si es posible)
    
    Returns:
        ServiceStatus: Estado de los workers
    """
    import time
    start = time.time()
    
    try:
        # Verificar Redis (workers dependen de Redis)
        redis_client = get_redis_client()
        await redis_client.ping()
        
        # Intentar obtener información de la cola de Arq
        # Arq usa claves específicas en Redis
        try:
            # Verificar si hay jobs en la cola
            queue_length = await redis_client.llen("arq:queue")
            latency_ms = (time.time() - start) * 1000
            
            return ServiceStatus(
                name="worker",
                status="up",
                latency_ms=latency_ms
            )
        except Exception:
            # Si no podemos leer la cola, pero Redis funciona, workers están "ready"
            latency_ms = (time.time() - start) * 1000
            return ServiceStatus(
                name="worker",
                status="up",
                latency_ms=latency_ms
            )
    
    except Exception as e:
        return ServiceStatus(
            name="worker",
            status="down",
            error=str(e)
        )


async def check_ai_engine() -> ServiceStatus:
    """
    Verifica el estado del motor de IA (Gemini).
    
    Returns:
        ServiceStatus: Estado del motor de IA
    """
    import time
    start = time.time()
    
    try:
        # Verificar que Gemini esté disponible
        ai_engine = GeminiEngine()
        is_healthy = await ai_engine.health_check()
        
        latency_ms = (time.time() - start) * 1000
        
        if is_healthy:
            return ServiceStatus(
                name="ai_engine",
                status="up",
                latency_ms=latency_ms
            )
        else:
            return ServiceStatus(
                name="ai_engine",
                status="degraded",
                latency_ms=latency_ms,
                error="Health check returned False"
            )
    
    except Exception as e:
        return ServiceStatus(
            name="ai_engine",
            status="down",
            error=str(e)
        )


# ============================================
# ENDPOINTS
# ============================================

@router.get(
    "",
    response_model=Dict[str, Any],
    summary="Health check completo del sistema",
    description="Verifica el estado de todos los servicios críticos: Database, Redis, Workers, AI Engine"
)
async def system_health() -> Dict[str, Any]:
    """
    Health check completo del sistema.
    
    Verifica:
    - PostgreSQL (Database)
    - Redis (Cache & Queue)
    - Workers (Arq)
    - AI Engine (Gemini)
    
    Returns:
        Dict con estado de cada servicio y estado general del sistema
    
    Status Codes:
        - 200: Sistema saludable o degradado
        - 503: Sistema no saludable (servicios críticos caídos)
    """
    # Ejecutar todos los checks en paralelo
    db_status, redis_status, worker_status, ai_status = await asyncio.gather(
        check_database(),
        check_redis(),
        check_worker(),
        check_ai_engine(),
        return_exceptions=True
    )
    
    # Manejar excepciones en los checks
    if isinstance(db_status, Exception):
        db_status = ServiceStatus("database", "down", error=str(db_status))
    if isinstance(redis_status, Exception):
        redis_status = ServiceStatus("redis", "down", error=str(redis_status))
    if isinstance(worker_status, Exception):
        worker_status = ServiceStatus("worker", "down", error=str(worker_status))
    if isinstance(ai_status, Exception):
        ai_status = ServiceStatus("ai_engine", "down", error=str(ai_status))
    
    # Agrupar servicios
    services = {
        "database": db_status,
        "redis": redis_status,
        "worker": worker_status,
        "ai_engine": ai_status,
    }
    
    # Determinar estado general
    # - healthy: Todos los servicios críticos (db, redis) están up
    # - degraded: Servicios críticos up, pero algunos opcionales (ai_engine) están down
    # - unhealthy: Servicios críticos están down
    
    critical_services = ["database", "redis"]
    critical_down = any(
        services[name].status == "down"
        for name in critical_services
    )
    
    if critical_down:
        overall_status = "unhealthy"
        http_status = status.HTTP_503_SERVICE_UNAVAILABLE
    elif any(service.status == "down" for service in services.values()):
        overall_status = "degraded"
        http_status = status.HTTP_200_OK
    else:
        overall_status = "healthy"
        http_status = status.HTTP_200_OK
    
    # Construir respuesta
    response = SystemHealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        services=services
    )
    
    # Si el sistema está unhealthy, lanzar excepción HTTP
    if overall_status == "unhealthy":
        raise HTTPException(
            status_code=http_status,
            detail=response.to_dict()
        )
    
    return response.to_dict()


@router.get(
    "/simple",
    response_model=Dict[str, str],
    summary="Health check simple",
    description="Health check básico que solo verifica que la API responde"
)
async def simple_health() -> Dict[str, str]:
    """
    Health check simple (legacy compatibility).
    
    Retorna un estado básico sin verificar servicios individuales.
    Útil para load balancers y monitoreo básico.
    
    Returns:
        Dict con status básico
    """
    return {
        "status": "ok",
        "service": "BAI_Backend_v1",
        "version": settings.VERSION
    }

