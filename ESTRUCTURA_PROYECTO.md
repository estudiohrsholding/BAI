# 📋 ESTRUCTURA COMPLETA DEL PROYECTO B.A.I.

**Business Artificial Intelligence - Partner as a Service (PaaS)**

**Última actualización:** Noviembre 2025  
**Versión:** MVP Production Ready

---

## 📁 MAPA COMPLETO DEL PROYECTO

```
BAI/
├── 📄 .cursorrules                    # Reglas del arquitecto principal
├── 📄 .gitignore                      # Archivos ignorados por Git
├── 📄 AUDIT_REPORT.md                 # Reporte de auditoría de arquitectura
├── 📄 Caddyfile                       # Configuración del servidor web Caddy
├── 📄 docker-compose.yml              # Orquestación de servicios Docker
├── 📄 DOCUMENTACION_GRAFICOS_DATA_MINING.md  # Documentación de gráficos
├── 📄 ESTRUCTURA_PROYECTO.md          # Este archivo (mapa del proyecto)
├── 📄 package.json                    # Dependencias raíz (recharts)
├── 📄 package-lock.json               # Lock file de dependencias
├── 📄 README.md                       # Documentación principal
│
├── 📂 backend/                        # Backend FastAPI (Python 3.11)
│   ├── 📄 .dockerignore              # Archivos ignorados en Docker
│   ├── 📄 .env                        # Variables de entorno (local)
│   ├── 📄 .env.example                # Ejemplo de variables de entorno
│   ├── 📄 Dockerfile                  # Dockerfile para producción
│   ├── 📄 Dockerfile.dev              # Dockerfile para desarrollo
│   ├── 📄 pyproject.toml              # Configuración del proyecto Python
│   ├── 📄 requirements.txt            # Dependencias Python
│   │
│   └── 📂 app/                        # Aplicación FastAPI
│       ├── 📄 __init__.py             # Inicialización del módulo
│       ├── 📄 main.py                 # Punto de entrada FastAPI
│       │                               #   - Endpoints: /, /health
│       │                               #   - /api/chat, /api/chat/history
│       │                               #   - /api/v1/widget/chat
│       │
│       ├── 📂 api/                    # Módulo de API y rutas
│       │   ├── 📄 __init__.py
│       │   ├── 📄 deps.py             # Dependencias (get_current_user, get_session)
│       │   ├── 📄 router.py           # Router principal
│       │   │
│       │   └── 📂 routes/              # Rutas organizadas por dominio
│       │       ├── 📄 __init__.py
│       │       ├── 📄 auth.py          # /api/auth/* (login, register, me)
│       │       ├── 📄 billing.py      # /api/billing/* (Stripe)
│       │       └── 📄 data.py         # /api/data/* (logs, mining-report)
│       │
│       ├── 📂 core/                    # Configuración core
│       │   ├── 📄 config.py           # Settings y variables de entorno
│       │   ├── 📄 database.py         # Conexión PostgreSQL (SQLModel)
│       │   └── 📄 security.py         # JWT, hash de contraseñas (bcrypt)
│       │
│       ├── 📂 data/                   # Datos estáticos y configuración
│       │   └── 📂 inventories/        # Inventarios JSON por cliente
│       │       ├── 📄 cannabiapp-web-001.json    # Inventario Cannabiapp
│       │       ├── 📄 cliente-inmo-001.json      # Inventario inmobiliaria (genérico)
│       │       └── 📄 inmo-test-001.json         # Inventario inmobiliaria (test)
│       │
│       ├── 📂 models/                 # Modelos de datos (SQLModel + Pydantic)
│       │   ├── 📄 chat.py             # ChatMessage (user_id, role, content, timestamp)
│       │   ├── 📄 log.py               # SearchLog (user_id, query, summary, status)
│       │   ├── 📄 mining.py           # MiningReport (Pydantic, no tabla)
│       │   └── 📄 user.py             # User (id, email, hashed_password, is_active)
│       │
│       └── 📂 services/               # Lógica de negocio (Service Layer)
│           ├── 📄 __init__.py
│           ├── 📄 ai_service.py      # ✅ NUEVO: Servicio de IA (Service Layer)
│           │                           #   - generate_bai_response()
│           │                           #   - generate_widget_response()
│           │
│           ├── 📄 bai_brain.py        # Orquestador principal (legacy wrapper)
│           │                           #   - get_bai_response() → delega a AIService
│           │                           #   - get_widget_response() → delega a AIService
│           │
│           ├── 📄 mining_report.py    # Generación de informes de Data Mining
│           ├── 📄 stripe_service.py   # Integración con Stripe (pagos)
│           │
│           ├── 📂 brain/              # Módulo "The Modular Mind"
│           │   ├── 📄 __init__.py
│           │   ├── 📄 core.py         # NeuralCore (motor Gemini 2.5 Flash)
│           │   │                       #   - generate_with_history()
│           │   │                       #   - generate_stateless()
│           │   │                       #   - EmailCommandHandler
│           │   │
│           │   ├── 📄 prompts.py      # PromptManager (gestión de personalidades)
│           │   │                       #   - BAI_SYSTEM_PROMPT
│           │   │                       #   - INMO_SYSTEM_PROMPT
│           │   │                       #   - CANNABIAPP_PROMPT
│           │   │                       #   - _load_inventory() (dinámico desde JSON)
│           │   │
│           │   ├── 📄 memory.py       # MemoryService (gestión de historial)
│           │   │                       #   - get_formatted_history()
│           │   │                       #   - save_conversation_pair() (atómico)
│           │   │
│           │   └── 📄 tools.py         # ToolExecutor (detección y ejecución)
│           │                           #   - detect_and_execute() (n8n, Brave Search)
│           │
│           └── 📂 tools/               # Herramientas externas
│               ├── 📄 __init__.py
│               └── 📄 search.py       # Integración con Brave Search API
│
├── 📂 docker/                         # Configuraciones Docker adicionales
│
└── 📂 frontend/                       # Frontend Next.js 14 (React + TypeScript)
    ├── 📄 .dockerignore              # Archivos ignorados en Docker
    ├── 📄 .env.example                # Ejemplo de variables de entorno
    ├── 📄 .env.local                  # Variables de entorno (local)
    ├── 📄 Dockerfile.dev             # Dockerfile para desarrollo
    ├── 📄 next-env.d.ts               # Tipos de Next.js
    ├── 📄 next.config.js              # Configuración Next.js (legacy)
    ├── 📄 next.config.mjs             # Configuración Next.js (moderna)
    ├── 📄 package.json                # Dependencias y scripts
    ├── 📄 package-lock.json           # Lock file de dependencias
    ├── 📄 postcss.config.js           # Configuración PostCSS (legacy)
    ├── 📄 postcss.config.mjs          # Configuración PostCSS (moderna)
    ├── 📄 tailwind.config.ts          # Configuración Tailwind CSS
    ├── 📄 tsconfig.json                # Configuración TypeScript
    ├── 📄 tsconfig.tsbuildinfo         # Cache de TypeScript
    │
    ├── 📂 public/                     # Archivos estáticos
    │   ├── 📄 bai-widget.js           # Widget embebible (vanilla JS, 19KB)
    │   │                               #   - Detecta localhost/producción
    │   │                               #   - Envía historial al backend
    │   │                               #   - data-client-id para multi-tenencia
    │   │
    │   ├── 📄 test-inmo.html          # Demo: Inmobiliaria Los Altos (14KB)
    │   │                               #   - 9 propiedades en inventario
    │   │                               #   - Integra bai-widget.js
    │   │
    │   ├── 📄 widget-demo.html        # Demo simple del widget (2.6KB)
    │   │
    │   └── 📂 videos/                 # Videos promocionales
    │       └── 📄 Generación_de_Video_Promocional_BAI.mp4  # Video promocional (19MB)
    │
    └── 📂 src/                         # Código fuente
        │
        ├── 📂 app/                     # Next.js App Router
        │   ├── 📄 layout.tsx          # Layout raíz (ThemeProvider, metadata)
        │   ├── 📄 globals.css         # Estilos globales
        │   ├── 📄 page.tsx            # ✅ Landing Page Corporativa (raíz: /)
        │   │                           #   - Navbar con glassmorphism
        │   │                           #   - Hero: "No contrates software. Contrata un Socio."
        │   │                           #   - Video promocional
        │   │                           #   - PricingSection
        │   │                           #   - Footer
        │   │
        │   ├── 📂 (platform)/         # Grupo de rutas: Dashboard protegido
        │   │   ├── 📄 layout.tsx      # Layout con Sidebar + BaiAvatar
        │   │   │
        │   │   ├── 📂 dashboard/      # Dashboard principal
        │   │   │   └── 📄 page.tsx    # Vista principal del dashboard
        │   │   │
        │   │   ├── 📂 automation/     # Servicio 1: Automatización
        │   │   │   └── 📄 page.tsx    # Página de automatización
        │   │   │
        │   │   ├── 📂 data-mining/    # Servicio 3: Data Mining
        │   │   │   └── 📄 page.tsx    # Dashboard de Data Mining
        │   │   │                       #   - Lock screen
        │   │   │                       #   - Processing terminal
        │   │   │                       #   - Dashboard con gráficos (recharts)
        │   │   │
        │   │   ├── 📂 software/       # Software Studio
        │   │   │   ├── 📄 page.tsx    # Catálogo de Software
        │   │   │   └── 📄 constants.ts # Constantes del catálogo (APP_CATALOG)
        │   │   │
        │   │   ├── 📂 demos/          # Demos dinámicas
        │   │   │   └── 📂 [appId]/    # Ruta dinámica
        │   │   │       └── 📄 page.tsx # Demos: cannabiapp, restaurantiapp, neural-core
        │   │   │
        │   │   ├── 📂 plans/          # Planes y precios
        │   │   │   └── 📄 page.tsx    # Página de planes (usa PricingSection)
        │   │   │
        │   │   ├── 📂 checkout/       # Checkout Stripe
        │   │   │   └── 📄 page.tsx    # Página de checkout
        │   │   │
        │   │   └── 📂 settings/       # Configuración de usuario
        │   │       └── 📄 page.tsx    # Página de configuración
        │   │
        │   ├── 📂 app-test/           # ✅ Ensamblador (ruta: /app-test)
        │   │   └── 📄 page.tsx        # Renderizador inteligente LEGO DUAL
        │   │                           #   - Lee app-registry.ts
        │   │                           #   - Renderiza módulos según configuración
        │   │
        │   ├── 📂 marketing/          # Marketing page (ruta: /marketing)
        │   │   ├── 📄 layout.tsx      # Layout simple para marketing
        │   │   └── 📄 page.tsx        # Página de marketing (Ensamblador duplicado)
        │   │
        │   ├── 📂 login/              # Autenticación
        │   │   └── 📄 page.tsx        # Página de login
        │   │
        │   └── 📂 register/           # Registro
        │       └── 📄 page.tsx        # Página de registro
        │
        ├── 📂 components/             # Componentes React (Atomic Design)
        │   │
        │   ├── 📂 atoms/              # Componentes atómicos
        │   │   └── 📄 Button.tsx      # Botón reutilizable
        │   │
        │   ├── 📂 molecules/          # Componentes moleculares
        │   │   ├── 📄 AutomationVisuals.tsx  # Visualizaciones de automatización
        │   │   ├── 📄 ServiceCard.tsx         # Tarjeta de servicio
        │   │   ├── 📄 SystemStatus.tsx       # Estado del sistema (usa api-client)
        │   │   └── 📂 data-mining/    # (vacío actualmente)
        │   │
        │   ├── 📂 organisms/          # Componentes orgánicos
        │   │   ├── 📄 BaiAvatar.tsx   # Avatar con menú desplegable
        │   │   ├── 📄 ChatWindow.tsx  # Ventana de chat completa (usa api-client)
        │   │   └── 📄 Sidebar.tsx    # Barra lateral principal
        │   │
        │   ├── 📂 templates/          # Plantillas de página
        │   │   └── 📄 DashboardShell.tsx  # Shell del dashboard (Sidebar + contenido)
        │   │
        │   ├── 📂 sections/          # Secciones de página
        │   │   └── 📄 PricingSection.tsx    # Sección de precios (Basic, Premium, Enterprise)
        │   │
        │   ├── 📂 modules/            # Módulos específicos de negocio (Legacy)
        │   │   ├── 📂 CannabiApp/
        │   │   │   └── 📄 OwnerDashboard.tsx  # Dashboard verde (cannabis)
        │   │   │
        │   │   ├── 📂 restaurantiapp/
        │   │   │   └── 📄 OwnerDashboard.tsx  # Dashboard naranja (restaurante)
        │   │   │
        │   │   ├── 📂 neural-core/
        │   │   │   └── 📄 OwnerDashboard.tsx  # Dashboard dorado (AIaaS)
        │   │   │
        │   │   ├── 📂 data-mining/
        │   │   │   └── 📄 ProcessingTerminal.tsx  # Terminal de procesamiento
        │   │   │
        │   │   └── 📄 registry.tsx    # Registro de dashboards dinámicos
        │   │
        │   ├── 📂 ui/                 # Componentes UI reutilizables
        │   │   ├── 📄 BaiLogo.tsx     # Logo de B.A.I.
        │   │   └── 📄 PageAnimation.tsx  # Animaciones de página
        │   │
        │   ├── 📄 BaiAvatar.tsx       # ⚠️ Legacy (duplicado, usar organisms/)
        │   ├── 📄 ChatWidget.tsx      # ⚠️ Legacy (widget de chat antiguo)
        │   ├── 📄 Sidebar.tsx         # ⚠️ Legacy (duplicado, usar organisms/)
        │   └── 📄 theme-provider.tsx  # Provider de tema (dark/light)
        │
        ├── 📂 config/                 # ✅ Configuración centralizada
        │   └── 📄 app-registry.ts     # Registro de apps verticales (LEGO DUAL)
        │                               #   - APP_CATALOG (restaurantiapp, inmoai)
        │                               #   - getCurrentApp()
        │                               #   - isModuleActive()
        │
        ├── 📂 context/                # Context API de React
        │   ├── 📄 ChatContext.tsx     # Contexto del chat
        │   └── 📄 DashboardContext.tsx # Contexto del dashboard
        │
        ├── 📂 lib/                    # Utilidades y helpers
        │   ├── 📄 api-client.ts       # ✅ Cliente API centralizado
        │   │                           #   - fetchWithAuth() (inyección automática token)
        │   │                           #   - apiGet(), apiPost(), apiPut(), apiDelete()
        │   │                           #   - apiPublic() (sin autenticación)
        │   │                           #   - Redirección automática en 401
        │   │                           #   - Manejo centralizado de errores
        │   │
        │   ├── 📄 api.ts              # ⚠️ Legacy (funciones de URL, usar api-client.ts)
        │   └── 📄 utils.ts            # Utilidades generales (cn, etc.)
        │
        ├── 📂 modules/                # ✅ Arquitectura LEGO DUAL (Nueva)
        │   ├── 📂 core/               # Módulos del núcleo (vacío actualmente)
        │   │
        │   └── 📂 verticals/         # Módulos verticales (LEGO DUAL)
        │       └── 📂 hero-section/  # Primer módulo LEGO
        │           └── 📄 index.tsx   # HeroAdmin + HeroPublic
        │
        ├── 📂 styles/                 # Estilos adicionales
        │   └── 📄 globals.css         # ⚠️ Duplicado (usar app/globals.css)
        │
        └── 📄 middleware.ts           # Middleware de Next.js (protección de rutas)
                                        #   - Estrategia "Allow List"
                                        #   - Verifica JWT desde cookies
```

---

## 📊 ESTADÍSTICAS DEL PROYECTO

### Archivos por Tipo

**Frontend:**
- **TypeScript/TSX**: ~50 archivos
- **Componentes React**: ~35 componentes
- **Páginas Next.js**: 15+ páginas
- **Configuración**: 8 archivos

**Backend:**
- **Python**: ~30 archivos
- **Modelos SQLModel**: 4 modelos
- **Servicios**: 8 servicios
- **Rutas API**: 3 módulos de rutas

**Infraestructura:**
- **Docker**: 3 Dockerfiles
- **Configuración**: docker-compose.yml, Caddyfile

**Documentación:**
- **Markdown**: 4 archivos
- **README**: 1 archivo principal

---

## 🗺️ MAPA DE RUTAS (Frontend)

### 🌐 Rutas Públicas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | ✅ Landing Page Corporativa (B.A.I. marketing) |
| `/marketing` | `app/marketing/page.tsx` | Página de marketing (Ensamblador duplicado) |
| `/app-test` | `app/app-test/page.tsx` | ✅ Ensamblador LEGO DUAL (pruebas) |
| `/login` | `app/login/page.tsx` | Página de login |
| `/register` | `app/register/page.tsx` | Página de registro |

### 🔒 Rutas Protegidas (Platform)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/dashboard` | `app/(platform)/dashboard/page.tsx` | Dashboard principal |
| `/automation` | `app/(platform)/automation/page.tsx` | Servicio 1: Automatización |
| `/data-mining` | `app/(platform)/data-mining/page.tsx` | Servicio 3: Data Mining |
| `/software` | `app/(platform)/software/page.tsx` | Catálogo de Software |
| `/demos/[appId]` | `app/(platform)/demos/[appId]/page.tsx` | Demos dinámicas |
| `/plans` | `app/(platform)/plans/page.tsx` | Planes y precios |
| `/checkout` | `app/(platform)/checkout/page.tsx` | Checkout Stripe |
| `/settings` | `app/(platform)/settings/page.tsx` | Configuración |

### 🎮 Demos Disponibles

- `/demos/cannabiapp` → Dashboard verde (cannabis)
- `/demos/restaurantiapp` → Dashboard naranja (restaurante)
- `/demos/neural-core` → Dashboard dorado (AIaaS)

---

## 🔌 API ENDPOINTS (Backend)

### 🔓 Endpoints Públicos

| Método | Ruta | Descripción | Archivo |
|--------|------|-------------|---------|
| GET | `/` | Root endpoint | `main.py` |
| GET | `/health` | Health check | `main.py` |
| POST | `/api/v1/widget/chat` | Chat para widgets externos | `main.py` |

### 🔐 Endpoints Protegidos (Requieren JWT)

| Método | Ruta | Descripción | Archivo |
|--------|------|-------------|---------|
| POST | `/api/chat` | Chat interno B.A.I. | `main.py` |
| GET | `/api/chat/history` | Historial de chat | `main.py` |
| POST | `/api/auth/register` | Registro de usuario | `api/routes/auth.py` |
| POST | `/api/auth/token` | Login (OAuth2) | `api/routes/auth.py` |
| GET | `/api/auth/me` | Perfil de usuario | `api/routes/auth.py` |
| GET | `/api/data/logs` | Logs de búsqueda | `api/routes/data.py` |
| POST | `/api/data/mining-report` | Generar informe Data Mining | `api/routes/data.py` |
| POST | `/api/billing/upgrade` | Actualizar plan | `api/routes/billing.py` |
| POST | `/api/billing/create-checkout` | Crear sesión Stripe | `api/routes/billing.py` |

---

## 🧩 ARQUITECTURA DE COMPONENTES

### 🎨 Atomic Design Structure

**Atoms (1 componente):**
- `Button.tsx`

**Molecules (3 componentes):**
- `AutomationVisuals.tsx`
- `ServiceCard.tsx`
- `SystemStatus.tsx`

**Organisms (3 componentes):**
- `BaiAvatar.tsx`
- `ChatWindow.tsx`
- `Sidebar.tsx`

**Templates (1 componente):**
- `DashboardShell.tsx`

**Sections (1 componente):**
- `PricingSection.tsx`

**Modules (5 componentes legacy):**
- `CannabiApp/OwnerDashboard.tsx`
- `restaurantiapp/OwnerDashboard.tsx`
- `neural-core/OwnerDashboard.tsx`
- `data-mining/ProcessingTerminal.tsx`
- `registry.tsx`

**UI Components (2 componentes):**
- `BaiLogo.tsx`
- `PageAnimation.tsx`

---

## 🧠 ARQUITECTURA "THE MODULAR MIND" (Backend)

### 🎯 Separación de Responsabilidades

```
main.py (Entry Point)
    ↓
    ├── api/routes/ (HTTP Layer)
    │   ├── auth.py      → AuthService (implícito)
    │   ├── billing.py   → StripeService
    │   └── data.py      → MiningReportService
    │
    └── services/ (Business Logic Layer)
        ├── ai_service.py ✅ (Service Layer)
        │   ├── generate_bai_response()
        │   └── generate_widget_response()
        │
        ├── bai_brain.py (Legacy Orchestrator)
        │   └── Delega a AIService
        │
        └── brain/ (Low-level AI Operations)
            ├── core.py         → NeuralCore (Gemini 2.5 Flash)
            ├── prompts.py      → PromptManager (Personalidades)
            ├── memory.py       → MemoryService (Historial)
            └── tools.py         → ToolExecutor (n8n, Brave Search)
```

---

## 🏗️ ARQUITECTURA "LEGO DUAL" (Frontend)

### 🎯 Módulos Verticales

```
app-registry.ts (Cerebro de Configuración)
    ↓
    ├── restaurantiapp
    │   ├── Theme: Orange
    │   └── Modules: [hero_section, booking_system]
    │
    └── inmoai
        ├── Theme: Slate
        └── Modules: [hero_section]

modules/verticals/ (LEGO DUAL)
    └── hero-section/
        ├── HeroAdmin (Cara A - Dashboard)
        └── HeroPublic (Cara B - Landing)
```

---

## 📦 DEPENDENCIAS PRINCIPALES

### Frontend (package.json)

**Producción:**
- `next`: 14.2.5 (Framework React)
- `react`: 18.3.1
- `react-dom`: 18.3.1
- `recharts`: ^3.5.0 (Gráficos)
- `framer-motion`: ^12.23.24 (Animaciones)
- `js-cookie`: ^3.0.5 (Gestión de cookies JWT)
- `next-themes`: ^0.4.6 (Tema dark/light)
- `clsx`: ^2.1.1 (Utilidad para clases CSS)
- `tailwind-merge`: ^2.6.0 (Merge de clases Tailwind)
- `lucide-react`: ^0.441.0 (Iconos)

**Desarrollo:**
- `typescript`: 5.5.4
- `tailwindcss`: 3.4.10

### Backend (requirements.txt)

- `fastapi`: >=0.109.0 (Framework web)
- `uvicorn[standard]`: >=0.27.0 (Servidor ASGI)
- `pydantic`: >=2.5.0 (Validación de datos)
- `sqlmodel`: >=0.0.14 (ORM - SQLAlchemy + Pydantic)
- `psycopg[binary]`: >=3.2.0 (Driver PostgreSQL)
- `google-generativeai`: >=0.8.0 (API de Gemini 2.5 Flash)
- `httpx`: >=0.26.0 (Cliente HTTP async)
- `bcrypt`: ==4.0.1 (Hashing de contraseñas)
- `python-jose[cryptography]`: >=3.3.0 (JWT)
- `stripe`: >=7.0.0 (Pagos)

---

## 🐳 DOCKER & INFRAESTRUCTURA

### Servicios (docker-compose.yml)

1. **frontend** (Puerto 3000)
   - Next.js 14 en modo desarrollo
   - Hot reload activado
   - Volúmenes montados

2. **backend** (Puerto 8000)
   - FastAPI con uvicorn
   - Variables de entorno desde `.env`
   - Depende de `db`
   - Volumen compartido: `shared_data:/app/app/data`

3. **db** (Puerto 5432)
   - PostgreSQL 15 Alpine
   - Volumen persistente: `db-data`
   - Usuario: `postgres`, DB: `bai`

4. **n8n** (Puerto 5678)
   - Automatización de workflows
   - Acceso interno desde backend
   - Volumen persistente: `n8n_data`
   - Volumen compartido: `shared_data:/data/shared`

5. **caddy** (Puertos 80, 443)
   - Servidor web reverse proxy
   - Configuración desde `Caddyfile`

**Red:**
- Red bridge `bai` para comunicación entre servicios

**Volúmenes:**
- `db-data`: Datos de PostgreSQL
- `n8n_data`: Datos de n8n
- `caddy_data`: Datos de Caddy
- `caddy_config`: Configuración de Caddy
- `shared_data`: ✅ Volumen compartido entre backend y n8n

---

## 🗄️ MODELOS DE DATOS

### Tablas de Base de Datos

1. **User** (`models/user.py`)
   - `id` (Integer, PK)
   - `email` (String, único)
   - `hashed_password` (String)
   - `is_active` (Boolean)
   - `created_at` (DateTime)

2. **ChatMessage** (`models/chat.py`)
   - `id` (Integer, PK)
   - `user_id` (Integer, FK → User)
   - `role` (String: "user" | "bai")
   - `content` (String)
   - `timestamp` (DateTime)

3. **SearchLog** (`models/log.py`)
   - `id` (Integer, PK)
   - `user_id` (Integer, FK → User)
   - `query` (String)
   - `summary` (String)
   - `status` (String)
   - `timestamp` (DateTime)

4. **MiningReport** (`models/mining.py`) - Modelo Pydantic (no tabla)
   - Estructura JSON para informes de Data Mining
   - Se almacena como JSON en la respuesta

---

## 🔐 SEGURIDAD

### 🛡️ Middleware de Protección

**`middleware.ts`** - Estrategia "Allow List"
- Rutas públicas: `/`, `/login`, `/register`
- Rutas protegidas: Todo lo demás requiere autenticación
- Verifica JWT desde cookies

### 🔑 Autenticación

- **JWT** almacenado en cookies (`js-cookie`)
- **Header**: `Authorization: Bearer <token>`
- **Hashing**: `bcrypt` (versión 4.0.1)
- **Redirección automática**: Cliente API redirige a `/login` en 401

### 🌐 CORS

- **Selective CORS Middleware**: Diferentes políticas por ruta
- **Widget público**: CORS abierto (`*`) para multi-tenencia
- **Endpoints autenticados**: CORS restringido a orígenes confiables

---

## 🎨 ESTILOS Y UI

### 🎨 Framework de Estilos

- **Tailwind CSS** 3.4.10
- **Shadcn/ui** (componentes UI)
- **Framer Motion** (animaciones)
- **Lucide React** (iconos)

### 🌓 Tema

- **Dark Mode** por defecto
- **next-themes** para gestión de tema
- Soporte para light/dark toggle

---

## 🚀 SCRIPTS Y COMANDOS

### Frontend
```bash
npm run dev      # Desarrollo (puerto 3000)
npm run build    # Build de producción
npm run start    # Servidor de producción
```

### Backend
```bash
# Ejecutado dentro de Docker
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker
```bash
docker compose up --build    # Construir y levantar servicios
docker compose down          # Detener servicios
docker compose up -d --build backend   # Rebuild backend
docker compose up -d --build frontend  # Rebuild frontend
```

---

## 📝 NOTAS IMPORTANTES

### ✅ Mejoras Recientes

1. **Service Layer Pattern** (Backend)
   - `AIService` centraliza lógica de IA
   - Separación clara entre HTTP y Business Logic

2. **API Client Centralizado** (Frontend)
   - `api-client.ts` con inyección automática de token
   - Redirección automática en 401
   - Manejo centralizado de errores

3. **LEGO DUAL Architecture** (Frontend)
   - `app-registry.ts` como cerebro de configuración
   - Módulos verticales con dos caras (Admin/Public)
   - Renderizado dinámico según configuración

4. **Volumen Compartido** (Docker)
   - `shared_data` entre backend y n8n
   - Inventarios JSON accesibles desde ambos servicios

### ⚠️ Archivos Legacy/Backup

- Componentes duplicados: `BaiAvatar.tsx`, `Sidebar.tsx` (legacy en raíz)
- `api.ts` (legacy, usar `api-client.ts`)
- `styles/globals.css` (duplicado, usar `app/globals.css`)

### 🔄 Arquitectura de Rutas

- **Next.js 14 App Router** con grupos de rutas `(platform)` y `(marketing)`
- **Layouts anidados** para compartir UI entre rutas
- **Dynamic routes** para demos: `/demos/[appId]`

### 🌐 Widget para Producción

El widget `bai-widget.js` detecta automáticamente:
- **Desarrollo**: `http://localhost:8000`
- **Producción**: `https://baibussines.com`

---

## 📊 RESUMEN EJECUTIVO

**Total de archivos:**
- Frontend TypeScript/TSX: ~50 archivos
- Backend Python: ~30 archivos
- Componentes React: ~35 componentes
- Páginas Next.js: 15+ páginas
- Endpoints API: 10+ endpoints
- Modelos de datos: 4 modelos

**Arquitecturas implementadas:**
- ✅ Service Layer Pattern (Backend)
- ✅ LEGO DUAL Architecture (Frontend)
- ✅ API Client Centralizado (Frontend)
- ✅ The Modular Mind (Backend)
- ✅ Multi-tenencia (Widget + Inventarios JSON)

**Estado del proyecto:**
- ✅ MVP Production Ready
- ✅ Arquitectura escalable
- ✅ Código mantenible
- ✅ Documentación completa

---

**Fin del Mapa del Proyecto** 🎯
