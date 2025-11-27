"""
FastAPI Application - Modular Monolith Entry Point

Este es el punto de entrada para la nueva arquitectura Modular Monolith.
Mantiene compatibilidad con main.py durante la migración.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.telemetry import setup_telemetry
from app.core.exceptions import (
    BAIException,
    bai_exception_handler,
    ai_engine_exception_handler,
    validation_exception_handler
)
from app.infrastructure.db.session import init_db
from app.api.v1.router import api_router
from app.modules.chat.engine.interface import AIEngineError
from fastapi.exceptions import RequestValidationError


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events para la aplicación.
    
    Startup: Inicializa base de datos y telemetría
    Shutdown: Limpia recursos (Redis, etc.)
    """
    # Startup
    print("🚀 Inicializando B.A.I. Modular Monolith...")
    init_db()
    setup_telemetry(app)
    print("✅ B.A.I. iniciado correctamente")
    
    yield
    
    # Shutdown
    print("🛑 Cerrando B.A.I...")
    from app.infrastructure.cache.redis import close_redis
    await close_redis()
    print("✅ B.A.I. cerrado correctamente")


def create_app() -> FastAPI:
    """
    Factory function para crear la aplicación FastAPI.
    
    Returns:
        FastAPI: Aplicación configurada
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # Configurar CORS
    configure_cors(app)
    
    # Registrar exception handlers
    register_exception_handlers(app)
    
    # Incluir routers
    app.include_router(api_router)
    
    # Health check
    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {
            "status": "ok",
            "service": "BAI_Backend_Modular",
            "version": settings.VERSION
        }
    
    return app


def configure_cors(app: FastAPI):
    """Configura CORS para la aplicación"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # TODO: Restringir en producción
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def register_exception_handlers(app: FastAPI):
    """Registra handlers globales de excepciones"""
    app.add_exception_handler(BAIException, bai_exception_handler)
    app.add_exception_handler(AIEngineError, ai_engine_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)


# Crear aplicación
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main-modular:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

