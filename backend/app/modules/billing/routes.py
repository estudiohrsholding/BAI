"""
Billing Routes - Endpoints HTTP del Módulo Billing

Define los endpoints HTTP para el módulo Billing.
Solo maneja HTTP (request/response), delega la lógica a BillingService.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request, Header
from typing import Optional

from app.modules.billing.schemas import (
    CreateCheckoutSessionRequest,
    CheckoutSessionResponse,
    WebhookResponse
)
from app.modules.billing.service import BillingService
from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.user import User
from sqlmodel import Session


router = APIRouter(prefix="/api/v1/billing", tags=["billing"])


# Dependency para obtener BillingService
def get_billing_service() -> BillingService:
    """Dependency factory para BillingService."""
    return BillingService()


@router.post(
    "/create-checkout-session",
    response_model=CheckoutSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Crear sesión de checkout de Stripe",
    description="Crea una sesión de checkout de Stripe para un plan de suscripción"
)
async def create_checkout_session(
    request: CreateCheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    billing_service: BillingService = Depends(get_billing_service)
) -> CheckoutSessionResponse:
    """
    Endpoint para crear una sesión de checkout de Stripe.
    
    Requiere autenticación. El usuario será redirigido a Stripe Checkout
    para completar el pago.
    
    Args:
        request: Datos del plan deseado
        current_user: Usuario autenticado
        session: Sesión de base de datos
        billing_service: Servicio de billing (inyectado)
    
    Returns:
        CheckoutSessionResponse: URL de checkout de Stripe
    
    Raises:
        HTTPException: Si el plan no es válido o falla la creación de la sesión
    """
    try:
        checkout_url = billing_service.create_checkout_session(
            user_id=current_user.id,
            user_email=current_user.email,
            plan=request.plan,
            session=session
        )
        
        return CheckoutSessionResponse(url=checkout_url)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear sesión de checkout: {str(e)}"
        )


@router.post(
    "/webhooks/stripe",
    response_model=WebhookResponse,
    status_code=status.HTTP_200_OK,
    summary="Webhook de Stripe (público)",
    description="Endpoint público para recibir eventos de webhook de Stripe. Verifica la firma criptográfica."
)
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
    session: Session = Depends(get_session),
    billing_service: BillingService = Depends(get_billing_service)
) -> WebhookResponse:
    """
    Endpoint público para recibir webhooks de Stripe.
    
    IMPORTANTE: Este endpoint NO requiere autenticación, pero verifica
    la firma criptográfica del header 'stripe-signature' para asegurar
    que el request proviene realmente de Stripe.
    
    Args:
        request: Request de FastAPI (para obtener el body raw)
        stripe_signature: Header 'stripe-signature' de Stripe
        session: Sesión de base de datos
        billing_service: Servicio de billing (inyectado)
    
    Returns:
        WebhookResponse: Confirmación de recepción
    
    Raises:
        HTTPException 400: Si la firma no es válida
        HTTPException 500: Si falla el procesamiento del evento
    """
    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'stripe-signature' header"
        )
    
    try:
        # Obtener el body raw (bytes) del request
        body = await request.body()
        
        # Verificar la firma criptográfica
        event = billing_service.verify_webhook_signature(
            payload=body,
            signature=stripe_signature
        )
        
        # Procesar el evento
        result = billing_service.handle_webhook_event(
            event=event,
            session=session
        )
        
        return WebhookResponse(
            received=True,
            message=result.get("message", "Webhook procesado correctamente")
        )
    
    except ValueError as e:
        # Firma inválida o payload inválido
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid webhook signature or payload: {str(e)}"
        )
    except Exception as e:
        # Error al procesar el evento
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando webhook: {str(e)}"
        )

