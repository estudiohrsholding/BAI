"""
API v1 Router - Router Principal de la API

Agrupa todos los routers de módulos bajo el prefijo /api/v1
"""

from fastapi import APIRouter

from app.modules.chat.routes import router as chat_router
from app.api.v1.endpoints.utils import router as utils_router
from app.api.v1.endpoints.health import router as health_router
# from app.modules.billing.routes import router as billing_router
# from app.modules.tenancy.routes import router as tenancy_router

# Router principal
api_router = APIRouter(prefix="/api/v1")

# Incluir routers de módulos
api_router.include_router(chat_router)
api_router.include_router(utils_router)
api_router.include_router(health_router)
# api_router.include_router(billing_router, prefix="/billing", tags=["billing"])
# api_router.include_router(tenancy_router, prefix="/tenancy", tags=["tenancy"])

