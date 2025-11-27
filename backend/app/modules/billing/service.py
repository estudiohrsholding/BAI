"""
Billing Service - Lógica de Negocio del Módulo Billing

Este servicio orquesta toda la lógica relacionada con Stripe:
- Creación de sesiones de checkout
- Verificación de webhooks
- Actualización de suscripciones de usuarios
- Gestión de clientes de Stripe

Principio: Single Responsibility (SRP)
- Este servicio solo maneja la lógica de negocio de billing
- No conoce detalles de HTTP (routes) ni de persistencia (repository)
"""

import stripe
from typing import Optional
from sqlmodel import Session, select

from app.core.config import settings
from app.models.user import User, PlanTier, SubscriptionStatus
from app.core.exceptions import BAIException


class BillingService:
    """
    Servicio de negocio para el módulo Billing.
    
    Coordina la lógica de negocio de pagos y suscripciones sin conocer
    detalles de implementación de infraestructura (HTTP, base de datos).
    """
    
    def __init__(self):
        """Inicializa el servicio con la API key de Stripe."""
        if not settings.STRIPE_API_KEY:
            raise ValueError(
                "STRIPE_API_KEY is not configured. Please set it in your .env file."
            )
        stripe.api_key = settings.STRIPE_API_KEY
    
    def create_checkout_session(
        self,
        user_id: int,
        user_email: str,
        plan: str,
        session: Session
    ) -> str:
        """
        Crea una sesión de checkout de Stripe para un plan de suscripción.
        
        Args:
            user_id: ID del usuario
            user_email: Email del usuario (para Stripe customer)
            plan: Plan deseado ("motor", "cerebro", "partner")
            session: Sesión de base de datos (para obtener/crear Stripe customer)
        
        Returns:
            str: URL de checkout de Stripe
        
        Raises:
            ValueError: Si el plan no es válido o no tiene price_id configurado
            stripe.error.StripeError: Si la llamada a Stripe falla
        """
        # Mapear plan a PlanTier y obtener price_id
        plan_mapping = self._get_plan_mapping(plan)
        if not plan_mapping:
            raise ValueError(f"Plan '{plan}' no es válido. Use: motor, cerebro, partner")
        
        # Obtener o crear Stripe customer
        user = session.exec(select(User).where(User.id == user_id)).first()
        if not user:
            raise ValueError(f"Usuario con ID {user_id} no encontrado")
        
        stripe_customer_id = user.stripe_customer_id
        
        # Si no tiene customer_id, crear uno en Stripe
        if not stripe_customer_id:
            customer = stripe.Customer.create(
                email=user_email,
                metadata={"user_id": str(user_id)}
            )
            stripe_customer_id = customer.id
            
            # Guardar customer_id en la base de datos
            user.stripe_customer_id = stripe_customer_id
            session.add(user)
            session.commit()
            session.refresh(user)
        
        # Crear sesión de checkout
        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            mode="subscription",
            payment_method_types=["card"],
            line_items=[
                {
                    "price": plan_mapping["price_id"],
                    "quantity": 1,
                }
            ],
            success_url=f"{settings.DOMAIN}/checkout?success=true",
            cancel_url=f"{settings.DOMAIN}/#pricing?canceled=true",
            client_reference_id=str(user_id),  # Para tracking en webhooks
            metadata={
                "user_id": str(user_id),
                "plan": plan,
                "plan_tier": plan_mapping["plan_tier"].value
            }
        )
        
        return checkout_session.url
    
    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str
    ) -> dict:
        """
        Verifica la firma criptográfica de un webhook de Stripe.
        
        Args:
            payload: Cuerpo raw del request (bytes)
            signature: Header 'stripe-signature' del request
        
        Returns:
            dict: Evento de Stripe verificado (dict con 'type' y 'data')
        
        Raises:
            ValueError: Si la firma no es válida o STRIPE_WEBHOOK_SECRET no está configurado
            stripe.error.SignatureVerificationError: Si la verificación falla
        """
        if not settings.STRIPE_WEBHOOK_SECRET:
            raise ValueError(
                "STRIPE_WEBHOOK_SECRET is not configured. Please set it in your .env file."
            )
        
        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                settings.STRIPE_WEBHOOK_SECRET
            )
            return event  # stripe.Webhook.construct_event retorna un dict
        except ValueError as e:
            raise ValueError(f"Invalid payload: {str(e)}")
        except stripe.error.SignatureVerificationError as e:
            raise ValueError(f"Invalid signature: {str(e)}")
    
    def handle_webhook_event(
        self,
        event: dict,
        session: Session
    ) -> dict:
        """
        Procesa un evento de webhook de Stripe y actualiza el estado del usuario.
        
        Args:
            event: Evento de Stripe verificado
            session: Sesión de base de datos
        
        Returns:
            dict: Resultado del procesamiento
        
        Raises:
            ValueError: Si el evento no puede ser procesado
        """
        event_type = event["type"]
        event_data = event["data"]["object"]
        
        if event_type == "checkout.session.completed":
            return self._handle_checkout_completed(event_data, session)
        elif event_type == "customer.subscription.deleted":
            return self._handle_subscription_deleted(event_data, session)
        elif event_type == "customer.subscription.updated":
            return self._handle_subscription_updated(event_data, session)
        else:
            # Evento no manejado (no es error, solo lo ignoramos)
            return {
                "status": "ignored",
                "event_type": event_type,
                "message": f"Evento '{event_type}' no requiere acción"
            }
    
    def _handle_checkout_completed(
        self,
        session_data: dict,
        db_session: Session
    ) -> dict:
        """
        Maneja el evento checkout.session.completed.
        
        Actualiza el plan_tier y subscription_status del usuario.
        """
        # Obtener metadata de la sesión
        metadata = session_data.get("metadata", {})
        user_id = int(metadata.get("user_id"))
        plan_tier_str = metadata.get("plan_tier", "MOTOR")
        
        # Obtener usuario
        user = db_session.exec(select(User).where(User.id == user_id)).first()
        if not user:
            raise ValueError(f"Usuario con ID {user_id} no encontrado")
        
        # Actualizar plan y estado
        user.plan_tier = PlanTier(plan_tier_str)
        user.subscription_status = SubscriptionStatus.ACTIVE
        
        # Actualizar stripe_customer_id si no estaba configurado
        # El customer puede venir como string (customer ID) o como objeto
        customer_id = session_data.get("customer")
        if isinstance(customer_id, dict):
            customer_id = customer_id.get("id")
        if not user.stripe_customer_id and customer_id:
            user.stripe_customer_id = str(customer_id)
        
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        return {
            "status": "success",
            "event_type": "checkout.session.completed",
            "user_id": user_id,
            "new_plan": plan_tier_str,
            "message": f"Usuario {user_id} actualizado a plan {plan_tier_str}"
        }
    
    def _handle_subscription_deleted(
        self,
        subscription_data: dict,
        db_session: Session
    ) -> dict:
        """
        Maneja el evento customer.subscription.deleted.
        
        Marca la suscripción como cancelada.
        """
        customer_id = subscription_data.get("customer")
        
        # Buscar usuario por stripe_customer_id
        user = db_session.exec(
            select(User).where(User.stripe_customer_id == customer_id)
        ).first()
        
        if not user:
            # Usuario no encontrado (puede ser un customer de prueba)
            return {
                "status": "ignored",
                "event_type": "customer.subscription.deleted",
                "message": f"Usuario con customer_id {customer_id} no encontrado"
            }
        
        # Marcar como cancelado
        user.subscription_status = SubscriptionStatus.CANCELED
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        return {
            "status": "success",
            "event_type": "customer.subscription.deleted",
            "user_id": user.id,
            "message": f"Suscripción del usuario {user.id} cancelada"
        }
    
    def _handle_subscription_updated(
        self,
        subscription_data: dict,
        db_session: Session
    ) -> dict:
        """
        Maneja el evento customer.subscription.updated.
        
        Actualiza el estado de la suscripción según el estado en Stripe.
        """
        customer_id = subscription_data.get("customer")
        status = subscription_data.get("status")
        
        # Buscar usuario
        user = db_session.exec(
            select(User).where(User.stripe_customer_id == customer_id)
        ).first()
        
        if not user:
            return {
                "status": "ignored",
                "event_type": "customer.subscription.updated",
                "message": f"Usuario con customer_id {customer_id} no encontrado"
            }
        
        # Mapear estado de Stripe a nuestro enum
        if status == "active":
            user.subscription_status = SubscriptionStatus.ACTIVE
        elif status in ["past_due", "unpaid"]:
            user.subscription_status = SubscriptionStatus.PAST_DUE
        elif status == "canceled":
            user.subscription_status = SubscriptionStatus.CANCELED
        
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        return {
            "status": "success",
            "event_type": "customer.subscription.updated",
            "user_id": user.id,
            "new_status": user.subscription_status.value,
            "message": f"Estado de suscripción del usuario {user.id} actualizado a {user.subscription_status.value}"
        }
    
    def _get_plan_mapping(self, plan: str) -> Optional[dict]:
        """
        Mapea un plan string a PlanTier y price_id de Stripe.
        
        Args:
            plan: Plan string ("motor", "cerebro", "partner")
        
        Returns:
            dict con "plan_tier" y "price_id", o None si el plan no es válido
        
        Raises:
            ValueError: Si el plan no tiene price_id configurado (en producción)
        """
        # Mapeo de planes a PlanTier y Stripe Price IDs
        plan_mappings = {
            "motor": {
                "plan_tier": PlanTier.MOTOR,
                "price_id": getattr(settings, "STRIPE_PRICE_MOTOR", None)
            },
            "cerebro": {
                "plan_tier": PlanTier.CEREBRO,
                "price_id": getattr(settings, "STRIPE_PRICE_CEREBRO", None)
            },
            "partner": {
                "plan_tier": PlanTier.PARTNER,
                "price_id": getattr(settings, "STRIPE_PRICE_PARTNER", None)
            }
        }
        
        mapping = plan_mappings.get(plan.lower())
        if not mapping:
            return None
        
        # Validar que el price_id esté configurado
        if not mapping["price_id"]:
            raise ValueError(
                f"STRIPE_PRICE_{plan.upper()} no está configurado. "
                "Por favor, configura el Price ID de Stripe en las variables de entorno."
            )
        
        return mapping

