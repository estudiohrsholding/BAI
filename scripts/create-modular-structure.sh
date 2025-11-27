#!/bin/bash

# B.A.I. SYSTEMS - Script de Creación de Estructura Modular Monolith
# Basado en Domain-Driven Design (DDD) y Vertical Slice Architecture

set -e

echo "🏗️  Creando estructura Modular Monolith para B.A.I..."

BACKEND_DIR="backend/app"

# ============================================
# 1. CREAR ESTRUCTURA DE MÓDULOS
# ============================================
echo ""
echo "📦 Creando módulos de dominio..."

# Módulo Chat
mkdir -p "$BACKEND_DIR/modules/chat/engine"
touch "$BACKEND_DIR/modules/chat/__init__.py"
touch "$BACKEND_DIR/modules/chat/models.py"
touch "$BACKEND_DIR/modules/chat/schemas.py"
touch "$BACKEND_DIR/modules/chat/service.py"
touch "$BACKEND_DIR/modules/chat/repository.py"
touch "$BACKEND_DIR/modules/chat/routes.py"
touch "$BACKEND_DIR/modules/chat/engine/__init__.py"
touch "$BACKEND_DIR/modules/chat/engine/interface.py"
touch "$BACKEND_DIR/modules/chat/engine/gemini.py"
touch "$BACKEND_DIR/modules/chat/engine/memory.py"
echo "  ✅ Módulo chat/ creado"

# Módulo Billing
mkdir -p "$BACKEND_DIR/modules/billing"
touch "$BACKEND_DIR/modules/billing/__init__.py"
touch "$BACKEND_DIR/modules/billing/models.py"
touch "$BACKEND_DIR/modules/billing/schemas.py"
touch "$BACKEND_DIR/modules/billing/service.py"
touch "$BACKEND_DIR/modules/billing/stripe_adapter.py"
touch "$BACKEND_DIR/modules/billing/routes.py"
echo "  ✅ Módulo billing/ creado"

# Módulo Tenancy
mkdir -p "$BACKEND_DIR/modules/tenancy"
touch "$BACKEND_DIR/modules/tenancy/__init__.py"
touch "$BACKEND_DIR/modules/tenancy/models.py"
touch "$BACKEND_DIR/modules/tenancy/schemas.py"
touch "$BACKEND_DIR/modules/tenancy/service.py"
touch "$BACKEND_DIR/modules/tenancy/middleware.py"
touch "$BACKEND_DIR/modules/tenancy/routes.py"
echo "  ✅ Módulo tenancy/ creado"

# Módulo Analytics (futuro)
mkdir -p "$BACKEND_DIR/modules/analytics"
touch "$BACKEND_DIR/modules/analytics/__init__.py"
touch "$BACKEND_DIR/modules/analytics/models.py"
touch "$BACKEND_DIR/modules/analytics/service.py"
touch "$BACKEND_DIR/modules/analytics/routes.py"
echo "  ✅ Módulo analytics/ creado (placeholder)"

touch "$BACKEND_DIR/modules/__init__.py"

# ============================================
# 2. CREAR INFRAESTRUCTURA
# ============================================
echo ""
echo "🔧 Creando infraestructura..."

# Database
mkdir -p "$BACKEND_DIR/infrastructure/db/migrations"
touch "$BACKEND_DIR/infrastructure/__init__.py"
touch "$BACKEND_DIR/infrastructure/db/__init__.py"
touch "$BACKEND_DIR/infrastructure/db/session.py"
touch "$BACKEND_DIR/infrastructure/db/base.py"
echo "  ✅ infrastructure/db/ creado"

# Cache (Redis)
mkdir -p "$BACKEND_DIR/infrastructure/cache"
touch "$BACKEND_DIR/infrastructure/cache/__init__.py"
touch "$BACKEND_DIR/infrastructure/cache/redis.py"
echo "  ✅ infrastructure/cache/ creado"

# Vector Store
mkdir -p "$BACKEND_DIR/infrastructure/vector_store"
touch "$BACKEND_DIR/infrastructure/vector_store/__init__.py"
touch "$BACKEND_DIR/infrastructure/vector_store/interface.py"
touch "$BACKEND_DIR/infrastructure/vector_store/pgvector.py"
touch "$BACKEND_DIR/infrastructure/vector_store/qdrant.py"
echo "  ✅ infrastructure/vector_store/ creado"

# Messaging (futuro)
mkdir -p "$BACKEND_DIR/infrastructure/messaging"
touch "$BACKEND_DIR/infrastructure/messaging/__init__.py"
touch "$BACKEND_DIR/infrastructure/messaging/events.py"
echo "  ✅ infrastructure/messaging/ creado"

# ============================================
# 3. CREAR WORKERS
# ============================================
echo ""
echo "⚙️  Creando workers para tareas asíncronas..."

mkdir -p "$BACKEND_DIR/workers/tasks"
touch "$BACKEND_DIR/workers/__init__.py"
touch "$BACKEND_DIR/workers/config.py"
touch "$BACKEND_DIR/workers/worker.py"
touch "$BACKEND_DIR/workers/tasks/__init__.py"
touch "$BACKEND_DIR/workers/tasks/ai_inference.py"
touch "$BACKEND_DIR/workers/tasks/email_reports.py"
touch "$BACKEND_DIR/workers/tasks/data_mining.py"
echo "  ✅ workers/ creado"

# ============================================
# 4. ACTUALIZAR CORE
# ============================================
echo ""
echo "🔐 Actualizando core/..."

touch "$BACKEND_DIR/core/exceptions.py"
touch "$BACKEND_DIR/core/telemetry.py"
touch "$BACKEND_DIR/core/dependencies.py"
echo "  ✅ core/ actualizado"

# ============================================
# 5. ACTUALIZAR API
# ============================================
echo ""
echo "🌐 Actualizando estructura de API..."

mkdir -p "$BACKEND_DIR/api/v1"
mkdir -p "$BACKEND_DIR/api/middleware"
touch "$BACKEND_DIR/api/v1/__init__.py"
touch "$BACKEND_DIR/api/v1/router.py"
touch "$BACKEND_DIR/api/v1/dependencies.py"
touch "$BACKEND_DIR/api/middleware/__init__.py"
touch "$BACKEND_DIR/api/middleware/cors.py"
touch "$BACKEND_DIR/api/middleware/telemetry.py"
touch "$BACKEND_DIR/api/middleware/tenant.py"
echo "  ✅ api/ actualizado"

# ============================================
# 6. CREAR TESTS
# ============================================
echo ""
echo "🧪 Creando estructura de tests..."

mkdir -p "$BACKEND_DIR/tests/unit/modules/chat"
mkdir -p "$BACKEND_DIR/tests/integration"
mkdir -p "$BACKEND_DIR/tests/e2e"
touch "$BACKEND_DIR/tests/__init__.py"
touch "$BACKEND_DIR/tests/conftest.py"
touch "$BACKEND_DIR/tests/unit/__init__.py"
touch "$BACKEND_DIR/tests/unit/modules/__init__.py"
touch "$BACKEND_DIR/tests/unit/modules/chat/__init__.py"
touch "$BACKEND_DIR/tests/unit/modules/chat/test_service.py"
touch "$BACKEND_DIR/tests/integration/__init__.py"
touch "$BACKEND_DIR/tests/integration/test_chat_flow.py"
touch "$BACKEND_DIR/tests/e2e/__init__.py"
touch "$BACKEND_DIR/tests/e2e/test_api.py"
echo "  ✅ tests/ creado"

# ============================================
# RESUMEN
# ============================================
echo ""
echo "✅ Estructura Modular Monolith creada exitosamente"
echo ""
echo "📊 Resumen:"
echo "  - Módulos de dominio: 4 (chat, billing, tenancy, analytics)"
echo "  - Infraestructura: 4 (db, cache, vector_store, messaging)"
echo "  - Workers: 3 tareas (ai_inference, email_reports, data_mining)"
echo "  - Tests: 3 niveles (unit, integration, e2e)"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Implementar módulo chat/ (prueba de concepto)"
echo "  2. Configurar workers con Arq + Redis"
echo "  3. Setup OpenTelemetry en core/telemetry.py"
echo "  4. Migrar código existente gradualmente"
echo ""

