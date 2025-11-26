# 📋 ESTRUCTURA COMPLETA DEL PROYECTO B.A.I.

**Business Artificial Intelligence - Partner as a Service (PaaS)**

---

## 📁 ESTRUCTURA GENERAL DEL PROYECTO

```
BAI/
├── backend/              # Backend FastAPI (Python)
├── frontend/            # Frontend Next.js 14 (React + TypeScript)
├── docker/              # Configuraciones Docker adicionales
├── docker-compose.yml   # Orquestación de servicios
├── Caddyfile           # Configuración del servidor web Caddy
├── package.json        # Dependencias raíz (recharts)
├── README.md           # Documentación principal
└── DOCUMENTACION_GRAFICOS_DATA_MINING.md
```

---

## 🎨 FRONTEND (Next.js 14 - App Router)

### 📂 Estructura de Directorios

```
frontend/
├── public/                          # Archivos estáticos
│   ├── bai-widget.js               # Widget embebible para clientes externos
│   ├── test-inmo.html              # Demo: Inmobiliaria Los Altos
│   ├── widget-demo.html            # Demo simple del widget
│   └── videos/
│       └── Generación_de_Video_Promocional_BAI.mp4
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (marketing)/            # Grupo de rutas: Landing pública
│   │   │   ├── layout.tsx         # Layout del marketing
│   │   │   └── page.tsx           # Página principal (Landing)
│   │   │
│   │   ├── (platform)/            # Grupo de rutas: Dashboard protegido
│   │   │   ├── layout.tsx        # Layout con Sidebar + Avatar
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx       # Dashboard principal
│   │   │   │   └── page.backout.tsx
│   │   │   ├── automation/
│   │   │   │   └── page.tsx       # Página de Automatización
│   │   │   ├── data-mining/
│   │   │   │   ├── page.tsx       # Dashboard de Data Mining
│   │   │   │   └── page.backound.tsx
│   │   │   ├── software/
│   │   │   │   ├── page.tsx       # Catálogo de Software
│   │   │   │   ├── page.backup.tsx
│   │   │   │   └── constants.ts   # Constantes del catálogo
│   │   │   ├── demos/
│   │   │   │   └── [appId]/
│   │   │   │       └── page.tsx  # Demos dinámicas (cannabiapp, restaurantiapp, neural-core)
│   │   │   ├── plans/
│   │   │   │   └── page.tsx      # Página de Planes/Precios
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx      # Checkout de Stripe
│   │   │   └── settings/
│   │   │       └── page.tsx      # Configuración de usuario
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx          # Página de Login
│   │   ├── register/
│   │   │   └── page.tsx          # Página de Registro
│   │   ├── layout.tsx            # Layout raíz (providers, metadata)
│   │   └── globals.css           # Estilos globales
│   │
│   ├── components/                # Componentes React (Atomic Design)
│   │   ├── atoms/                 # Componentes atómicos
│   │   │   └── Button.tsx
│   │   │
│   │   ├── molecules/            # Componentes moleculares
│   │   │   ├── AutomationVisuals.tsx
│   │   │   ├── ServiceCard.tsx
│   │   │   ├── SystemStatus.tsx
│   │   │   └── data-mining/      # (vacío actualmente)
│   │   │
│   │   ├── organisms/            # Componentes orgánicos
│   │   │   ├── Sidebar.tsx      # Barra lateral principal
│   │   │   ├── ChatWindow.tsx   # Ventana de chat
│   │   │   └── BaiAvatar.tsx    # Avatar con menú desplegable
│   │   │
│   │   ├── templates/            # Plantillas de página
│   │   │   └── DashboardShell.tsx  # Shell del dashboard (Sidebar + contenido)
│   │   │
│   │   ├── sections/            # Secciones de página
│   │   │   └── PricingSection.tsx
│   │   │
│   │   ├── modules/              # Módulos específicos de negocio
│   │   │   ├── CannabiApp/
│   │   │   │   └── OwnerDashboard.tsx  # Dashboard verde (cannabis)
│   │   │   ├── restaurantiapp/
│   │   │   │   └── OwnerDashboard.tsx  # Dashboard naranja (restaurante)
│   │   │   ├── neural-core/
│   │   │   │   └── OwnerDashboard.tsx  # Dashboard dorado (AIaaS)
│   │   │   ├── data-mining/
│   │   │   │   └── ProcessingTerminal.tsx  # Terminal de procesamiento
│   │   │   └── registry.tsx     # Registro de dashboards dinámicos
│   │   │
│   │   ├── ui/                   # Componentes UI reutilizables
│   │   │   ├── BaiLogo.tsx
│   │   │   └── PageAnimation.tsx
│   │   │
│   │   ├── ChatWidget.tsx        # Widget de chat (legacy)
│   │   ├── BaiAvatar.tsx         # Avatar (legacy, duplicado)
│   │   ├── Sidebar.tsx           # Sidebar (legacy, duplicado)
│   │   └── theme-provider.tsx    # Provider de tema (dark/light)
│   │
│   ├── context/                  # Context API de React
│   │   ├── ChatContext.tsx       # Contexto del chat
│   │   └── DashboardContext.tsx # Contexto del dashboard
│   │
│   ├── lib/                      # Utilidades y helpers
│   │   ├── api.ts               # Funciones de API (fetch, endpoints)
│   │   └── utils.ts             # Utilidades generales (cn, etc.)
│   │
│   ├── middleware.ts            # Middleware de Next.js (protección de rutas)
│   └── styles/
│       └── globals.css          # Estilos globales (duplicado)
│
├── Dockerfile.dev               # Dockerfile para desarrollo
├── next.config.js              # Configuración de Next.js (legacy)
├── next.config.mjs            # Configuración de Next.js (moderna)
├── package.json                # Dependencias y scripts
├── postcss.config.js          # Configuración PostCSS (legacy)
├── postcss.config.mjs         # Configuración PostCSS (moderna)
├── tailwind.config.ts          # Configuración de Tailwind CSS
├── tsconfig.json               # Configuración de TypeScript
└── tsconfig.tsbuildinfo        # Cache de TypeScript
```

### 📦 Dependencias Principales (package.json)

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

**Desarrollo:**
- `typescript`: 5.5.4
- `tailwindcss`: 3.4.10
- `lucide-react`: ^0.441.0 (Iconos)
- `@types/*`: Tipos TypeScript

---

## 🐍 BACKEND (FastAPI - Python 3.11)

### 📂 Estructura de Directorios

```
backend/
├── app/
│   ├── __init__.py
│   │
│   ├── main.py                  # Punto de entrada FastAPI
│   │                            # - Endpoints: /, /health, /api/chat, /api/v1/widget/chat
│   │
│   ├── api/                     # Módulo de API y rutas
│   │   ├── __init__.py
│   │   ├── router.py            # Router principal
│   │   ├── deps.py              # Dependencias (get_current_user, get_session)
│   │   └── routes/              # Rutas organizadas por dominio
│   │       ├── __init__.py
│   │       ├── auth.py          # Rutas de autenticación (/api/auth/*)
│   │       ├── data.py          # Rutas de datos (/api/data/*)
│   │       └── billing.py      # Rutas de facturación (/api/billing/*)
│   │
│   ├── core/                    # Configuración core
│   │   ├── config.py           # Configuración (settings, variables de entorno)
│   │   ├── database.py         # Conexión a PostgreSQL (SQLModel)
│   │   └── security.py         # Utilidades de seguridad (JWT, hash)
│   │
│   ├── models/                  # Modelos de datos (SQLModel + Pydantic)
│   │   ├── user.py             # Modelo User
│   │   ├── chat.py             # Modelo ChatMessage
│   │   ├── log.py              # Modelo SearchLog
│   │   └── mining.py           # Modelos para Data Mining (MiningReport, DataPoint, etc.)
│   │
│   └── services/                # Lógica de negocio
│       ├── __init__.py
│       │
│       ├── bai_brain.py        # Orquestador principal del cerebro B.A.I.
│       │                        # - get_bai_response() (chat interno)
│       │                        # - get_widget_response() (chat externo)
│       │
│       ├── mining_report.py    # Generación de informes de Data Mining
│       │
│       ├── stripe_service.py   # Integración con Stripe (pagos)
│       │
│       ├── brain/              # Módulo "The Modular Mind"
│       │   ├── __init__.py
│       │   ├── core.py         # NeuralCore (motor Gemini)
│       │   │                    # - generate_with_history()
│       │   │                    # - generate_stateless()
│       │   │                    # - EmailCommandHandler
│       │   ├── prompts.py      # PromptManager (gestión de personalidades)
│       │   │                    # - BAI_SYSTEM_PROMPT
│       │   │                    # - INMO_SYSTEM_PROMPT
│       │   │                    # - MOCK_INVENTORY
│       │   ├── memory.py       # MemoryService (gestión de historial)
│       │   │                    # - get_formatted_history()
│       │   │                    # - save_conversation_pair()
│       │   └── tools.py         # ToolExecutor (detección y ejecución de herramientas)
│       │                        # - detect_and_execute() (n8n, Brave Search)
│       │
│       └── tools/               # Herramientas externas
│           ├── __init__.py
│           └── search.py       # Integración con Brave Search API
│
├── Dockerfile                   # Dockerfile para producción
├── Dockerfile.dev              # Dockerfile para desarrollo
├── requirements.txt            # Dependencias Python
└── pyproject.toml              # Configuración del proyecto Python
```

### 📦 Dependencias Principales (requirements.txt)

- `fastapi`: >=0.109.0 (Framework web)
- `uvicorn[standard]`: >=0.27.0 (Servidor ASGI)
- `pydantic`: >=2.5.0 (Validación de datos)
- `sqlmodel`: >=0.0.14 (ORM - SQLAlchemy + Pydantic)
- `psycopg[binary]`: >=3.2.0 (Driver PostgreSQL)
- `google-generativeai`: >=0.8.0 (API de Gemini)
- `httpx`: >=0.26.0 (Cliente HTTP async)
- `bcrypt`: ==4.0.1 (Hashing de contraseñas)
- `python-jose[cryptography]`: >=3.3.0 (JWT)
- `stripe`: >=7.0.0 (Pagos)

---

## 🐳 DOCKER & INFRAESTRUCTURA

### 📄 docker-compose.yml

**Servicios:**
1. **frontend** (Puerto 3000)
   - Next.js 14 en modo desarrollo
   - Hot reload activado
   - Volúmenes montados

2. **backend** (Puerto 8000)
   - FastAPI con uvicorn
   - Variables de entorno desde `.env`
   - Depende de `db`

3. **db** (Puerto 5432)
   - PostgreSQL 15 Alpine
   - Volumen persistente: `db-data`
   - Usuario: `postgres`, DB: `bai`

4. **n8n** (Puerto 5678)
   - Automatización de workflows
   - Acceso interno desde backend
   - Volumen persistente: `n8n_data`

5. **caddy** (Puertos 80, 443)
   - Servidor web reverse proxy
   - Configuración desde `Caddyfile`

**Red:**
- Red bridge `bai` para comunicación entre servicios

---

## 📱 PÁGINAS Y RUTAS

### 🌐 Rutas Públicas (Marketing)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/(marketing)/page.tsx` | Landing page pública |
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

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |
| POST | `/api/v1/widget/chat` | Chat para widgets externos |

### 🔐 Endpoints Protegidos (Requieren JWT)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/chat` | Chat interno B.A.I. |
| GET | `/api/chat/history` | Historial de chat |
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login de usuario |
| GET | `/api/data/mining-report` | Generar informe de Data Mining |
| POST | `/api/billing/*` | Endpoints de facturación |

---

## 🧩 COMPONENTES PRINCIPALES

### 🎨 Componentes por Categoría

**Atoms (Componentes básicos):**
- `Button.tsx` - Botón reutilizable

**Molecules (Componentes compuestos):**
- `AutomationVisuals.tsx` - Visualizaciones de automatización
- `ServiceCard.tsx` - Tarjeta de servicio
- `SystemStatus.tsx` - Estado del sistema

**Organisms (Componentes complejos):**
- `Sidebar.tsx` - Barra lateral principal
- `ChatWindow.tsx` - Ventana de chat completa
- `BaiAvatar.tsx` - Avatar con menú

**Templates:**
- `DashboardShell.tsx` - Shell del dashboard (Sidebar + contenido)

**Modules (Módulos de negocio):**
- `CannabiApp/OwnerDashboard.tsx` - Dashboard cannabis
- `restaurantiapp/OwnerDashboard.tsx` - Dashboard restaurante
- `neural-core/OwnerDashboard.tsx` - Dashboard AIaaS
- `data-mining/ProcessingTerminal.tsx` - Terminal de procesamiento
- `registry.tsx` - Registro de dashboards dinámicos

---

## 🗄️ MODELOS DE DATOS

### 📊 Tablas de Base de Datos

1. **User** (`models/user.py`)
   - `id`, `email`, `hashed_password`, `is_active`, `created_at`

2. **ChatMessage** (`models/chat.py`)
   - `id`, `user_id`, `role` (user/bai), `content`, `timestamp`

3. **SearchLog** (`models/log.py`)
   - `id`, `user_id`, `query`, `summary`, `status`, `timestamp`

4. **MiningReport** (`models/mining.py`) - Modelo Pydantic (no tabla)
   - Estructura JSON para informes de Data Mining

---

## 🧠 ARQUITECTURA "THE MODULAR MIND"

### 🎯 Separación de Responsabilidades

```
bai_brain.py (Orquestador)
    ↓
    ├── PromptManager (prompts.py)
    │   └── Gestión de personalidades y prompts
    │
    ├── MemoryService (memory.py)
    │   └── Gestión de historial de conversación
    │
    ├── ToolExecutor (tools.py)
    │   └── Detección y ejecución de herramientas (n8n, Brave)
    │
    └── NeuralCore (core.py)
        └── Motor de Gemini (generación de respuestas)
```

---

## 📦 ARCHIVOS ESTÁTICOS (Public)

### 🌐 Widget Embebible

- **`bai-widget.js`** (19KB)
  - Widget vanilla JavaScript
  - Embebible en cualquier sitio web
  - Detecta automáticamente desarrollo/producción
  - Envía historial de conversación al backend

### 🏠 Demos HTML

- **`test-inmo.html`** (14KB)
  - Demo completa: Inmobiliaria Los Altos
  - 9 propiedades en inventario
  - Integra `bai-widget.js` con `client_id="inmo-test-001"`

- **`widget-demo.html`** (2.6KB)
  - Demo simple del widget

### 🎬 Videos

- `videos/Generación_de_Video_Promocional_BAI.mp4` (19MB)

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
```

---

## 📝 NOTAS IMPORTANTES

### ⚠️ Archivos Legacy/Backup

- `page.backout.tsx` - Backup del dashboard
- `page.backound.tsx` - Backup de data-mining
- `page.backup.tsx` - Backup de software
- Componentes duplicados: `BaiAvatar.tsx`, `Sidebar.tsx` (legacy)

### 🔄 Arquitectura de Rutas

- **Next.js 14 App Router** con grupos de rutas `(marketing)` y `(platform)`
- **Layouts anidados** para compartir UI entre rutas
- **Dynamic routes** para demos: `/demos/[appId]`

### 🌐 Widget para Producción

El widget `bai-widget.js` detecta automáticamente:
- **Desarrollo**: `http://localhost:8000`
- **Producción**: `https://baibussines.com`

---

## 📊 ESTADÍSTICAS DEL PROYECTO

- **Total archivos TypeScript/TSX**: ~39
- **Total archivos Python**: ~27
- **Componentes React**: ~30+
- **Páginas Next.js**: 10+
- **Endpoints API**: 10+
- **Modelos de datos**: 4

---

**Última actualización**: Noviembre 2025
**Versión**: MVP Production Ready



