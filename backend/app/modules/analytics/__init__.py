"""
Analytics Module - Módulo de Analytics y Tracking

Maneja el tracking de uso de features y métricas de crecimiento.
Sigue el patrón Domain-Driven Design (DDD).
"""

from app.modules.analytics.service import AnalyticsService
from app.modules.analytics.routes import router

__all__ = ["AnalyticsService", "router"]

