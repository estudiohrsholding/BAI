# Módulo Billing - Integración con Stripe

Este módulo maneja toda la lógica relacionada con pagos, suscripciones y facturación usando Stripe.

## Configuración Requerida

### Variables de Entorno

```env
# Stripe API Keys
STRIPE_API_KEY=sk_test_...  # Tu Stripe Secret Key
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signing secret de Stripe

# Stripe Price IDs (creados en Stripe Dashboard)
STRIPE_PRICE_MOTOR=price_...  # Price ID para plan MOTOR
STRIPE_PRICE_CEREBRO=price_...  # Price ID para plan CEREBRO
STRIPE_PRICE_PARTNER=price_...  # Price ID para plan PARTNER (opcional, si usas checkout)

# Dominio para redirects
DOMAIN=https://baibussines.com  # O http://localhost:3000 en desarrollo
```

### Crear Price IDs en Stripe

1. Ve a Stripe Dashboard → Products
2. Crea un Product para cada plan (Motor, Cerebro, Partner)
3. Añade un Price recurrente (mensual) para cada producto
4. Copia el Price ID (empieza con `price_`) y añádelo a las variables de entorno

## Endpoints

### `POST /api/v1/billing/create-checkout-session`

Crea una sesión de checkout de Stripe para un plan de suscripción.

**Request:**
```json
{
  "plan": "motor" | "cerebro" | "partner"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Autenticación:** Requerida (JWT token)

### `POST /api/v1/billing/webhooks/stripe`

Endpoint público para recibir webhooks de Stripe.

**Headers:**
- `stripe-signature`: Firma criptográfica del webhook (automático desde Stripe)

**Autenticación:** No requerida (pero verifica la firma criptográfica)

## Eventos de Webhook Manejados

1. **`checkout.session.completed`**
   - Actualiza `plan_tier` y `subscription_status=ACTIVE` del usuario
   - Guarda `stripe_customer_id` si no estaba configurado

2. **`customer.subscription.deleted`**
   - Marca `subscription_status=CANCELED`

3. **`customer.subscription.updated`**
   - Actualiza `subscription_status` según el estado en Stripe

## Configurar Webhook en Stripe

1. Ve a Stripe Dashboard → Developers → Webhooks
2. Añade endpoint: `https://tu-dominio.com/api/v1/billing/webhooks/stripe`
3. Selecciona eventos:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copia el "Signing secret" y añádelo a `STRIPE_WEBHOOK_SECRET`

## Flujo de Pago

1. Usuario hace clic en "Encender Motor" / "Escalar con Cerebro" en PricingTable
2. Frontend redirige a `/checkout?plan=motor` o `/checkout?plan=cerebro`
3. Checkout page llama a `POST /api/v1/billing/create-checkout-session`
4. Backend crea sesión de Stripe y retorna URL
5. Frontend redirige a Stripe Checkout
6. Usuario completa el pago en Stripe
7. Stripe redirige a `{DOMAIN}/checkout?success=true`
8. Stripe envía webhook `checkout.session.completed` al backend
9. Backend actualiza `plan_tier` y `subscription_status` del usuario
10. Usuario ve mensaje de éxito y es redirigido al dashboard

## Seguridad

- ✅ Verificación criptográfica de webhooks usando `stripe-signature`
- ✅ Endpoints de checkout requieren autenticación JWT
- ✅ Webhook endpoint es público pero verifica la firma de Stripe
- ✅ No se almacenan datos de tarjeta (Stripe maneja todo)

