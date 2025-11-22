"""
Stripe Payment Service
Handles Stripe checkout session creation for subscription flows.
"""

import stripe
from app.core.config import settings


def create_checkout_session(user_id: int, price_id: str) -> str:
  """
  Create a Stripe Checkout Session for subscription.
  
  Goal: Generate a URL where the user can pay.
  
  Args:
    user_id: The ID of the user making the purchase (for webhook tracking)
    price_id: The Stripe Price ID for the subscription
    
  Returns:
    The checkout session URL for redirecting the user to Stripe Checkout
    
  Raises:
    ValueError: If STRIPE_API_KEY is not configured
    stripe.error.StripeError: If Stripe API call fails
  """
  # Validate API key is configured before setting it
  if not settings.STRIPE_API_KEY:
    raise ValueError("STRIPE_API_KEY is not configured. Please set it in your .env file.")
  
  # Set Stripe API key only if it's not None (after validation)
  # This prevents setting stripe.api_key to None at module import time
  stripe.api_key = settings.STRIPE_API_KEY
  
  try:
    # Create checkout session
    session = stripe.checkout.Session.create(
      mode="subscription",
      payment_method_types=["card"],
      line_items=[
        {
          "price": price_id,
          "quantity": 1,
        }
      ],
      success_url=f"{settings.DOMAIN}/dashboard?payment=success",
      cancel_url=f"{settings.DOMAIN}/plans?payment=cancelled",
      client_reference_id=str(user_id),  # CRITICAL for webhooks later
    )
    
    return session.url
    
  except stripe.error.StripeError as e:
    # Re-raise Stripe errors for proper handling in API routes
    raise e

