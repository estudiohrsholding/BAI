"""
Billing Module - Módulo de Facturación y Suscripciones

Maneja toda la lógica relacionada con pagos, suscripciones y facturación.
Sigue el patrón Domain-Driven Design (DDD).
"""

from app.modules.billing.service import BillingService
from app.modules.billing.routes import router

__all__ = ["BillingService", "router"]

