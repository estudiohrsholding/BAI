"""
Content Models - Modelos para Campañas y Piezas de Contenido

Este módulo define los modelos para almacenar campañas de marketing
y las piezas de contenido generadas por la IA.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class MarketingCampaign(SQLModel, table=True):
    """
    Modelo para almacenar campañas de marketing.
    
    Se crea cuando el usuario inicia una campaña desde el frontend.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str = Field(max_length=255)
    influencer_name: str = Field(max_length=255)
    tone_of_voice: str = Field(max_length=100)
    topic: str  # Tema/contexto de la campaña
    platforms: str = Field(max_length=500)  # JSON string o lista separada por comas
    content_count: int = Field(default=0)
    status: str = Field(default="pending", max_length=50)  # pending, in_progress, completed, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None


class ContentPiece(SQLModel, table=True):
    """
    Modelo para almacenar piezas individuales de contenido generadas.
    
    Cada pieza representa un Post, Reel, Story, etc. que se genera para una campaña.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    campaign_id: int = Field(foreign_key="marketingcampaign.id", index=True)
    platform: str = Field(max_length=50)  # Instagram, TikTok, YouTube, Twitter
    type: str = Field(max_length=50)  # Reel, Post, Story, Video, etc.
    caption: str = Field()  # Texto largo para el caption
    visual_script: str = Field()  # Texto largo para el script visual
    style: Optional[str] = Field(default="cinematic", max_length=50)  # "cinematic" o "avatar" - estilo de video
    media_url: Optional[str] = Field(default=None, max_length=1000)  # URL de imagen/video generado
    status: str = Field(default="PENDING", max_length=50)  # PENDING, GENERATING, COMPLETED, FAILED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

