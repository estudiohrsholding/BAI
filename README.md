# B.A.I. SYSTEMS - Partner as a Service Platform

**Versión:** 2.0 (The Skeleton Protocol)  
**Arquitectura:** Modular Monolith (DDD) + Tiered PaaS

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Lucide React

**Backend:**
- Python 3.11
- FastAPI (Async)
- SQLModel (ORM)
- Pydantic
- Alembic (Migrations)

**Infraestructura:**
- Docker & Docker Compose
- PostgreSQL 15
- Redis (Cache + Queue)
- Arq (Async Task Queue)
- Caddy (Reverse Proxy)

**IA Core:**
- Google Gemini 2.5 Flash
- Brave Search API

**Automatización:**
- n8n (self-hosted)

---

## 📦 Estructura del Proyecto

```
BAI/
├── frontend/              # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── (platform)/   # Área privada protegida
│   │   │   │   ├── automation/    # Vista Demo (categorizada)
│   │   │   │   ├── data-mining/   # Vista Demo (accesible)
│   │   │   │   ├── ecosistema/    # Vista Demo (catálogo)
│   │   │   │   └── configuracion/ # Vista de Acción (tabs)
│   │   │   └── page.tsx           # Landing Page (PaaS)
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── FeatureGate.tsx    # Bloqueo visual
│   │   │   │   └── PlanIndicator.tsx # Badge de plan
│   │   │   └── marketing/
│   │   │       └── PricingTable.tsx  # Tabla de precios
│   │   └── lib/
│   │       └── api-client.ts      # Cliente API centralizado
│   └── package.json
│
├── backend/               # FastAPI Modular Monolith
│   ├── app/
│   │   ├── modules/       # Módulos de dominio (DDD)
│   │   │   ├── chat/      # Módulo de Chat
│   │   │   └── mining/    # Módulo de Mining
│   │   ├── api/
│   │   │   └── deps.py    # requires_feature, requires_plan
│   │   ├── models/
│   │   │   └── user.py    # PlanTier, PLAN_FEATURE_MATRIX
│   │   ├── workers/       # Background tasks (Arq)
│   │   └── main.py        # FastAPI app
│   ├── alembic/           # Database migrations
│   └── requirements.txt
│
├── docker-compose.yml     # Orquestación de servicios
└── README.md
```

---

## 🚀 Puesta en Marcha

### Prerrequisitos

- Docker & Docker Compose
- Git

### Inicio Rápido

```bash
# Clonar el repositorio
git clone <repo-url>
cd BAI

# Iniciar todos los servicios
docker compose up --build

# Los servicios estarán disponibles en:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - n8n: http://localhost:5678
# - Worker: (background process)
```

### Variables de Entorno

Crear `.env` en la raíz del proyecto:

```env
# Backend
SECRET_KEY=tu-secret-key-minimo-32-caracteres
DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/bai
GOOGLE_API_KEY=tu-google-api-key
REDIS_URL=redis://redis:6379/0

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🎯 Sistema de Planes (PaaS)

### Planes Disponibles

| Plan | Descripción | Features Clave |
|------|-------------|----------------|
| **MOTOR** | El Cuerpo | Automatización básica, Software Studio |
| **CEREBRO** | La Voz | + IA Creativa, Data Mining, Workers asíncronos |
| **PARTNER** | El Cerebro | + Data Core, Squads embebidos, CSM dedicado |

### Feature Matrix

```python
PLAN_FEATURE_MATRIX = {
    PlanTier.MOTOR: {
        "access_mining": False,
        "access_marketing": False,
        "ai_content_generation": False,
        "max_chats": 1_000,
    },
    PlanTier.CEREBRO: {
        "access_mining": True,
        "access_marketing": True,
        "ai_content_generation": True,
        "max_chats": 10_000,
    },
    PlanTier.PARTNER: {
        "access_mining": True,
        "access_marketing": True,
        "ai_content_generation": True,
        "max_chats": 100_000,
        "dedicated_csm": True,
    },
}
```

---

## 🔒 Feature Gating

### Frontend Gate (Visual)

**Componente:** `FeatureGate`

```tsx
<FeatureGate requiredPlan="CEREBRO" currentPlan={userPlan}>
  {/* Contenido bloqueado para usuarios MOTOR */}
</FeatureGate>
```

### Backend Gate (API)

**Dependencias FastAPI:**

```python
# Por feature
@router.post("/endpoint")
async def endpoint(
    user: User = Depends(requires_feature("access_mining"))
):
    ...

# Por plan mínimo
@router.get("/endpoint")
async def endpoint(
    user: User = Depends(requires_plan(PlanTier.CEREBRO))
):
    ...
```

---

## 🧪 Testing

### Tests de Integración

```bash
cd backend
pytest tests/integration/test_gating.py -v
```

**Tests Implementados:**
- ✅ Usuario MOTOR no puede acceder a endpoints premium
- ✅ Usuario CEREBRO tiene acceso a Data Mining
- ✅ Usuario PARTNER tiene acceso completo
- ✅ Mensajes de error son informativos

### Stress Test

```bash
cd backend
python scripts/stress_test.py
```

**Métricas Esperadas:**
- Health check latency P95 < 200ms
- 100% de queues exitosas
- 100% de disponibilidad de API

---

## 📊 Health Check

**Endpoint:** `GET /api/v1/health`

**Verifica:**
- ✅ PostgreSQL (latency)
- ✅ Redis (ping)
- ✅ Worker Queue (status)
- ✅ AI Engine (Gemini connectivity)

**Frontend:**
- Componente `SystemStatus` en Sidebar
- Auto-refresh cada 30 segundos

---

## 🔄 Migraciones de Base de Datos

### Generar Migración

```bash
cd backend
docker compose exec backend alembic revision --autogenerate -m "descripción"
```

### Aplicar Migraciones

```bash
docker compose exec backend alembic upgrade head
```

### Revertir Migración

```bash
docker compose exec backend alembic downgrade -1
```

---

## 📝 Arquitectura Finalizada

### ✅ Implementado

1. **Sistema de Planes (PlanType)**
   - Enum `PlanTier` (MOTOR, CEREBRO, PARTNER)
   - `PLAN_FEATURE_MATRIX` define capacidades
   - Campo `plan_tier` en modelo User
   - Campo `features` (JSONB) para overrides

2. **Workers Asíncronos (Arq + Redis)**
   - Pool de Redis usando Singleton pattern
   - `WorkerSettings` configurado
   - Tareas: AI inference, Data mining, Email reports
   - Servicio `worker` en Docker Compose

3. **Feature Gating End-to-End**
   - Frontend: `FeatureGate` component
   - Backend: `requires_feature` y `requires_plan` dependencies
   - Tests de integración verificando bloqueo

4. **Health Check del Sistema**
   - Endpoint `/api/v1/health`
   - Componente `SystemStatus` en Frontend

5. **Flujo de Conversión**
   - CTAs apuntan a `/checkout?plan=X` o `/#pricing`
   - Mensajes claros sobre plan requerido
   - PricingTable con destinos monetizados

---

## 📚 Documentación Adicional

- **Auditoría Final:** `AUDIT_REPORT_FINAL.md`
- **Tests de Integración:** `backend/tests/integration/test_gating.py`
- **Stress Test:** `backend/scripts/stress_test.py`

---

## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Rebuild solo backend
docker compose up -d --build backend

# Rebuild solo frontend
docker compose up -d --build frontend

# Ver logs
docker compose logs -f backend
docker compose logs -f worker

# Acceder a shell del backend
docker compose exec backend bash
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker compose exec db psql -U postgres -d bai

# Ejecutar migraciones
docker compose exec backend alembic upgrade head
```

---

## 🎯 Próximos Pasos

### Fase 5: Integración de Pagos (Stripe)

1. Implementar página `/checkout`
2. Integrar Stripe Checkout Session
3. Webhook handler para actualizar suscripciones
4. Actualizar `plan_tier` y `stripe_customer_id` en User

### Fase 6: Dashboard de Métricas

1. Dashboard principal con métricas agregadas
2. Analytics de feature usage por plan
3. Tracking de conversión MOTOR → CEREBRO → PARTNER

---

## 📄 Licencia

Proprietary - B.A.I. Systems

---

**Última Actualización:** 2025-01-27  
**Versión:** 2.0 (The Skeleton Protocol)


INSERT INTO "user" (email, hashed_password, is_active, plan_tier, subscription_status)
VALUES (
    'joder@gmail.com', 
    'EL_HASH_GENERADO_EN_EL_PASO_1', 
    TRUE, 
    'MOTOR', 
    'ACTIVE'
);