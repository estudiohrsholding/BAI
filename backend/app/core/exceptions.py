"""
Global Exception Handlers

Define excepciones personalizadas y handlers globales para FastAPI.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.modules.chat.engine.interface import AIEngineError


class BAIException(Exception):
    """Excepción base para errores de B.A.I."""
    
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(BAIException):
    """Error de validación de datos"""
    
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class NotFoundError(BAIException):
    """Recurso no encontrado"""
    
    def __init__(self, message: str = "Recurso no encontrado"):
        super().__init__(message, status_code=404)


class UnauthorizedError(BAIException):
    """No autorizado"""
    
    def __init__(self, message: str = "No autorizado"):
        super().__init__(message, status_code=401)


# Global exception handlers (se registran en main.py)
async def bai_exception_handler(request: Request, exc: BAIException):
    """Handler para excepciones de B.A.I."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "error_type": exc.__class__.__name__
        }
    )


async def ai_engine_exception_handler(request: Request, exc: AIEngineError):
    """Handler para errores del motor de IA."""
    return JSONResponse(
        status_code=503,  # Service Unavailable
        content={
            "detail": f"Error del motor de IA: {str(exc)}",
            "error_type": "AIEngineError"
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler para errores de validación de Pydantic."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "error_type": "ValidationError"
        }
    )

