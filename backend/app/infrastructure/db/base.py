"""
Base Model - Clase base para todos los modelos SQLModel

Define la clase base con campos comunes (id, created_at, updated_at).
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class BaseModel(SQLModel):
    """
    Clase base para todos los modelos de dominio.
    
    Proporciona campos comunes: id, created_at, updated_at.
    """
    
    id: Optional[int] = Field(default=None, primary_key=True, description="ID único")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de creación")
    updated_at: Optional[datetime] = Field(default=None, description="Fecha de actualización")
    
    def update_timestamp(self):
        """Actualiza el timestamp de modificación"""
        self.updated_at = datetime.utcnow()

