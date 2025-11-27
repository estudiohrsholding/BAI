"""
API v1 Router - Router Principal de la API

Agrupa todos los routers de módulos bajo el prefijo /api/v1
"""

from fastapi import APIRouter

from app.modules.chat.routes import router as chat_router
from app.api.v1.endpoints.utils import router as utils_router
from app.api.v1.endpoints.health import router as health_router
from app.modules.mining.routes import router as mining_router
from app.modules.data_mining.routes import router as data_mining_router
from app.modules.billing.routes import router as billing_router
from app.modules.analytics.routes import router as analytics_router
from app.modules.content_creator.routes import router as content_router
from app.modules.content_planner.routes import router as content_planner_router
# from app.modules.tenancy.routes import router as tenancy_router

# Router principal
api_router = APIRouter(prefix="/api/v1")

# Incluir routers de módulos
api_router.include_router(chat_router)
api_router.include_router(utils_router)
api_router.include_router(health_router)
api_router.include_router(mining_router)
api_router.include_router(data_mining_router)
api_router.include_router(billing_router)
api_router.include_router(analytics_router)
api_router.include_router(content_router)
api_router.include_router(content_planner_router)
# api_router.include_router(tenancy_router, prefix="/tenancy", tags=["tenancy"])

