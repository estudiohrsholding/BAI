"""
Billing Schemas - Pydantic Schemas para Request/Response

Define los esquemas Pydantic para validación de requests y responses
del módulo Billing.
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional


class CreateCheckoutSessionRequest(BaseModel):
    """Request para crear una sesión de checkout de Stripe"""
    
    plan: Literal["motor", "cerebro", "partner"] = Field(
        ...,
        description="Plan de suscripción deseado"
    )


class CheckoutSessionResponse(BaseModel):
    """Response con la URL de checkout de Stripe"""
    
    url: str = Field(..., description="URL de Stripe Checkout para redirigir al usuario")


class WebhookEvent(BaseModel):
    """Modelo base para eventos de webhook de Stripe"""
    
    type: str = Field(..., description="Tipo de evento de Stripe")
    data: dict = Field(..., description="Datos del evento")


class WebhookResponse(BaseModel):
    """Response para webhooks de Stripe"""
    
    received: bool = Field(default=True, description="Indica si el webhook fue recibido correctamente")
    message: Optional[str] = Field(default=None, description="Mensaje opcional")

