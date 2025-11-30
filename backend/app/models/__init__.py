"""
Models Package - Importación centralizada de todos los modelos SQLModel

Este archivo asegura que todos los modelos estén importados y registrados
en SQLModel.metadata para que Alembic pueda detectarlos y crear las tablas.

IMPORTANTE: Todos los modelos con table=True deben estar importados aquí.
"""

# Importar todos los modelos de tabla para que Alembic los detecte
from .user import User
from .content import MarketingCampaign, ContentPiece
from .log import SearchLog
from .chat import ChatMessage

# mining.py solo contiene modelos Pydantic (BaseModel), no SQLModel con table=True
# Por lo tanto, no necesitamos importarlos aquí para Alembic

# Exportar todos los modelos para uso en otros módulos
__all__ = [
    "User",
    "MarketingCampaign",
    "ContentPiece",
    "SearchLog",
    "ChatMessage",
]

