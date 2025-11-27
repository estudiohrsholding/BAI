"""
Billing Models - Modelos de Dominio SQLModel

Define los modelos de dominio del módulo Billing.
Actualmente placeholder para futuras expansiones (historial de facturas, etc.).
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from app.infrastructure.db.base import BaseModel


# Placeholder para futuros modelos de facturación
# Ejemplo: Invoice, Subscription, PaymentHistory, etc.
# class Invoice(BaseModel, table=True):
#     """Modelo de factura generada"""
#     __tablename__ = "invoices"
#     
#     user_id: int = Field(foreign_key="user.id", index=True)
#     stripe_invoice_id: Optional[str] = Field(default=None, max_length=255)
#     amount: float = Field(..., description="Monto en centavos")
#     currency: str = Field(default="eur", max_length=3)
#     status: str = Field(..., description="paid, pending, failed")
#     paid_at: Optional[datetime] = Field(default=None)

