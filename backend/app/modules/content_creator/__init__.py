"""
Content Creator Module - Módulo de Generación de Contenido para Influencers IA

Maneja la creación y programación de campañas de contenido generado por IA.
Sigue el patrón Domain-Driven Design (DDD).
"""

from app.modules.content_creator.service import ContentCreatorService
from app.modules.content_creator.routes import router

__all__ = ["ContentCreatorService", "router"]

