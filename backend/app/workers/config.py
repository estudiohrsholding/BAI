"""
Arq Worker Configuration

Configuración para workers de tareas asíncronas usando Arq (Redis-based).

Arq es más ligero que Celery y perfecto para FastAPI async.
"""

from arq import create_pool
from arq.connections import RedisSettings
from arq.worker import Worker
from typing import Dict, Any
import os


# ============================================
# REDIS CONFIGURATION
# ============================================

REDIS_SETTINGS = RedisSettings(
    host=os.getenv("REDIS_HOST", "redis"),  # Docker service name
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD", None),
    database=int(os.getenv("REDIS_DB", 0)),
)


# ============================================
# WORKER FUNCTIONS
# ============================================

async def process_ai_inference(
    ctx: Dict[str, Any],
    message: str,
    user_id: int,
    client_id: str = None,
    history: list = None
) -> Dict[str, Any]:
    """
    Procesa una inferencia de IA en background (tarea larga).
    
    Esta función se ejecuta en un worker separado, no bloquea el request HTTP.
    
    Args:
        ctx: Contexto del worker (contiene Redis, etc.)
        message: Mensaje del usuario
        user_id: ID del usuario
        client_id: ID del cliente (opcional)
        history: Historial de conversación (opcional)
    
    Returns:
        Dict con la respuesta generada y metadata
    """
    from app.modules.chat.engine.gemini import GeminiEngine
    from app.infrastructure.db.session import get_session
    from app.modules.chat.repository import ChatRepository
    from app.modules.chat.service import ChatService
    
    # Inicializar dependencias
    ai_engine = GeminiEngine()
    session = next(get_session())
    repository = ChatRepository(session=session)
    service = ChatService(
        ai_engine=ai_engine,
        repository=repository,
        cache=None  # Cache opcional en workers
    )
    
    # Procesar mensaje
    response = await service.process_message(
        user_id=user_id,
        message=message,
        session=session,
        client_id=client_id,
        context={"history": history} if history else None
    )
    
    return {
        "response": response,
        "user_id": user_id,
        "status": "completed"
    }


async def send_email_report(
    ctx: Dict[str, Any],
    email: str,
    content: str,
    subject: str = "B.A.I. Report"
) -> Dict[str, str]:
    """
    Envía un reporte por email en background.
    
    Args:
        ctx: Contexto del worker
        email: Email destino
        content: Contenido del email
        subject: Asunto del email
    
    Returns:
        Dict con status del envío
    """
    # TODO: Implementar integración con servicio de email (SendGrid, SES, etc.)
    # Por ahora, simular
    print(f"[EMAIL] Enviando a {email}: {subject}")
    
    return {
        "status": "sent",
        "email": email
    }


async def process_data_mining(
    ctx: Dict[str, Any],
    topic: str,
    user_id: int
) -> Dict[str, Any]:
    """
    Procesa un trabajo de data mining en background.
    
    Args:
        ctx: Contexto del worker
        topic: Tema a investigar
        user_id: ID del usuario
    
    Returns:
        Dict con resultados del data mining
    """
    # TODO: Implementar lógica de data mining
    # Integración con Brave Search API, análisis, etc.
    
    return {
        "status": "completed",
        "topic": topic,
        "results": {}
    }


# ============================================
# WORKER CLASS CONFIGURATION
# ============================================

class WorkerSettings:
    """
    Configuración para el worker de Arq.
    
    Define qué funciones están disponibles como tareas.
    """
    
    functions = [
        process_ai_inference,
        send_email_report,
        process_data_mining,
    ]
    
    redis_settings = REDIS_SETTINGS
    
    # Configuración de workers
    max_jobs = 10  # Máximo de trabajos concurrentes
    job_timeout = 300  # Timeout de 5 minutos por trabajo


# ============================================
# HELPER FUNCTIONS
# ============================================

async def enqueue_ai_task(
    message: str,
    user_id: int,
    client_id: str = None
) -> str:
    """
    Encola una tarea de inferencia de IA.
    
    Args:
        message: Mensaje del usuario
        user_id: ID del usuario
        client_id: ID del cliente
    
    Returns:
        str: ID de la tarea (para tracking)
    """
    redis = await create_pool(REDIS_SETTINGS)
    
    job = await redis.enqueue_job(
        "process_ai_inference",
        message=message,
        user_id=user_id,
        client_id=client_id
    )
    
    return job.job_id

