"""
Arq Worker Settings

Configuración completa del worker de Arq con eventos de ciclo de vida.
Define on_startup y on_shutdown para inicializar y limpiar recursos.
"""

from typing import Dict, Any
from arq.connections import RedisSettings
from arq.worker import Worker

from app.core.config import settings
from app.infrastructure.db.session import init_db
from app.infrastructure.cache.redis import get_redis_client, close_redis
# Importar modelos para registrar metadata antes de usar la DB
from app.models.user import User  # noqa: F401
from app.modules.chat.models import ChatMessage  # noqa: F401


class WorkerSettings:
    """
    Configuración para el worker de Arq.
    
    Define:
    - Funciones disponibles como tareas
    - Configuración de Redis
    - Eventos de ciclo de vida (on_startup, on_shutdown)
    - Configuración de concurrencia y timeouts
    """
    
    # ============================================
    # REDIS CONFIGURATION
    # ============================================
    
    redis_settings = RedisSettings(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        password=settings.REDIS_PASSWORD,
        database=settings.REDIS_DB,
    )
    
    # ============================================
    # WORKER CONFIGURATION
    # ============================================
    
    # Máximo de trabajos concurrentes
    max_jobs = 10
    
    # Timeout por trabajo (5 minutos)
    job_timeout = 300
    
    # Tiempo máximo de espera para que un worker termine (10 minutos)
    max_worker_memory = 100 * 1024 * 1024  # 100 MB
    
    # ============================================
    # TASK FUNCTIONS
    # ============================================
    
    # Importar funciones de tareas desde módulos específicos
    from app.workers.tasks.system import heavy_background_task
    from app.workers.tasks.ai_inference import process_ai_inference
    from app.workers.tasks.email_reports import send_email_report
    from app.workers.tasks.data_mining import process_data_mining
    from app.workers.tasks.analytics import track_feature_use
    from app.workers.tasks.content_tasks import generate_influencer_content, schedule_monthly_content
    from app.workers.tasks.extraction_tasks import launch_deep_extraction
    
    functions = [
        heavy_background_task,
        process_ai_inference,
        send_email_report,
        process_data_mining,
        track_feature_use,
        generate_influencer_content,
        launch_deep_extraction,
        schedule_monthly_content,
    ]
    
    # ============================================
    # LIFECYCLE EVENTS
    # ============================================
    
    async def on_startup(ctx: Dict[str, Any]) -> None:
        """
        Evento de inicio del worker.
        
        Inicializa:
        - Base de datos (tablas si no existen)
        - Cliente de Redis (verificación de conexión)
        - Logging estructurado
        
        Args:
            ctx: Contexto del worker (contiene Redis pool, etc.)
        """
        import logging
        
        # Configurar logging básico
        logger = logging.getLogger("bai.worker")
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        logger.info(f"Worker starting - Environment: {settings.ENVIRONMENT}")
        
        # Inicializar base de datos
        try:
            init_db()
            logger.info("Database initialized")
        except Exception as e:
            logger.error(f"Database init failed: {str(e)}")
            raise
        
        # Verificar conexión a Redis
        try:
            redis_client = get_redis_client()
            await redis_client.ping()
            logger.info(f"Redis connected - URL: {settings.REDIS_URL}")
        except Exception as e:
            logger.error(f"Redis connection failed: {str(e)}")
            raise
        
        # Guardar cliente en contexto para uso en tareas
        ctx["redis"] = redis_client
        ctx["logger"] = logger
        
        logger.info(f"Worker started - Max jobs: {WorkerSettings.max_jobs}")
    
    async def on_shutdown(ctx: Dict[str, Any]) -> None:
        """
        Evento de cierre del worker.
        
        Limpia:
        - Conexiones de Redis
        - Sesiones de base de datos
        - Logging
        
        Args:
            ctx: Contexto del worker
        """
        logger = ctx.get("logger")
        if logger:
            logger.info("Worker shutting down")
        
        # Cerrar conexión de Redis
        try:
            await close_redis()
            if logger:
                logger.info("Redis connection closed")
        except Exception as e:
            if logger:
                logger.error(f"Redis close failed: {str(e)}")
        
        if logger:
            logger.info("Worker shutdown complete")

