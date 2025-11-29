# 🔍 AUDITORÍA: Flujo de Datos - Creación de Campaña de Marketing

**Fecha:** 2025-11-28  
**Auditor:** TestSprite QA Engine  
**Objetivo:** Detectar pérdida de datos y campos faltantes en el flujo de creación de campañas

---

## 📊 RESUMEN EJECUTIVO

### ⚠️ **CRÍTICO: Campo `topic`/`context` FALTANTE**

El sistema actual **NO incluye un campo para el tema o descripción del contenido** que se debe generar. Esto es **CRÍTICO** porque:

1. La IA (Gemini/DALL-E/HeyGen) **NO puede generar contenido sin saber sobre qué tema generar**
2. El usuario solo proporciona:
   - Nombre de la campaña (metadato)
   - Nombre del influencer (persona)
   - Tono de voz (estilo)
   - Plataformas (canales)
   - Cantidad de piezas (volumen)
3. **FALTA:** El tema/contenido/descripción de QUÉ se debe generar

---

## 🔍 ANÁLISIS DETALLADO POR CAPA

### 1. **FRONTEND: Formulario** (`frontend/src/app/(platform)/configuracion/page.tsx`)

#### Campos Actuales:
```typescript
// Estado del formulario (líneas 77-81)
const [campaignName, setCampaignName] = useState("");           // ✅ Nombre de campaña
const [influencerName, setInfluencerName] = useState("");      // ✅ Nombre del influencer
const [toneOfVoice, setToneOfVoice] = useState("profesional"); // ✅ Tono de voz
const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]); // ✅ Plataformas
const [contentCount, setContentCount] = useState(10);          // ✅ Cantidad de piezas
```

#### ❌ **CAMPO FALTANTE:**
- **`topic`** o **`description`** o **`context`**: No existe ningún campo para que el usuario especifique:
  - Sobre qué tema debe generar contenido
  - Qué mensaje quiere transmitir
  - Qué producto/servicio promocionar
  - Qué evento/ocasión celebrar

#### Datos Enviados (líneas 171-178):
```typescript
const campaignData: CampaignCreateRequest = {
  name: campaignName,                    // ✅
  influencer_name: influencerName,      // ✅
  tone_of_voice: toneOfVoice,            // ✅
  platforms: selectedPlatforms,          // ✅
  content_count: contentCount,           // ✅
  scheduled_at: null,                    // ✅
  // ❌ FALTA: topic, description, context, theme, etc.
};
```

---

### 2. **FRONTEND: API Client** (`frontend/src/lib/api-client.ts`)

#### Interface TypeScript (líneas 75-82):
```typescript
export interface CampaignCreateRequest {
  name: string;                    // ✅
  influencer_name: string;        // ✅
  tone_of_voice: string;          // ✅
  platforms: string[];            // ✅
  content_count: number;           // ✅
  scheduled_at?: string | null;    // ✅
  // ❌ FALTA: topic?: string;
  // ❌ FALTA: description?: string;
  // ❌ FALTA: context?: string;
}
```

#### Función de Envío (líneas 132-136):
```typescript
export async function createCampaign(
  data: CampaignCreateRequest
): Promise<CampaignCreatedResponse> {
  return apiPost<CampaignCreatedResponse>("/api/v1/marketing/create-campaign", data);
}
```

**Estado:** ✅ El mapeo es correcto, pero el tipo no incluye el campo faltante.

---

### 3. **BACKEND: Router** (`backend/app/api/routes/marketing.py`)

#### Pydantic Model (líneas 20-27):
```python
class CampaignCreateRequest(BaseModel):
    """Request model para crear una nueva campaña de marketing."""
    name: str                          # ✅
    influencer_name: str                # ✅
    tone_of_voice: str                 # ✅
    platforms: list[str]                # ✅
    content_count: int                  # ✅
    scheduled_at: str | None = None     # ✅
    # ❌ FALTA: topic: str
    # ❌ FALTA: description: str
    # ❌ FALTA: context: str
```

#### Payload a n8n (líneas 114-122):
```python
payload = {
    "user_id": user_in_session.id,
    "email": user_in_session.email,
    "campaign_name": campaign.name,
    "influencer": campaign.influencer_name,
    "tone": campaign.tone_of_voice,
    "platforms": campaign.platforms,
    "pieces": campaign.content_count
    # ❌ FALTA: "topic": campaign.topic
    # ❌ FALTA: "description": campaign.description
    # ❌ FALTA: "context": campaign.context
}
```

**Estado:** ❌ **CRÍTICO** - El backend no recibe ni transmite el tema del contenido a n8n.

---

## 🚨 IMPACTO DEL PROBLEMA

### Escenario Real:
1. Usuario crea campaña: "Campaña Q1 2025" para influencer "TechGuru_AI"
2. Selecciona tono: "profesional", plataformas: ["Instagram", "TikTok"]
3. Solicita: 10 piezas de contenido
4. **PROBLEMA:** ¿Sobre qué tema? ¿Qué producto? ¿Qué mensaje?

### Consecuencias:
- ❌ **n8n recibe la orden sin tema**: No puede generar contenido relevante
- ❌ **IA no tiene contexto**: Gemini/DALL-E/HeyGen no saben qué crear
- ❌ **Contenido genérico o fallido**: La generación fallará o será irrelevante
- ❌ **Créditos desperdiciados**: Se cobran créditos pero no se genera contenido útil

---

## ✅ SOLUCIÓN RECOMENDADA

### 1. **Añadir Campo `topic` o `description` al Formulario**

**Frontend - Nuevo campo:**
```typescript
// Añadir al estado
const [campaignTopic, setCampaignTopic] = useState("");

// Añadir al formulario (después de "Nombre de la Campaña")
<div>
  <label className="block text-sm font-medium text-slate-300 mb-2">
    Tema/Descripción del Contenido *
  </label>
  <textarea
    value={campaignTopic}
    onChange={(e) => setCampaignTopic(e.target.value)}
    placeholder="Ej: Promocionar nuevo producto de IA, Celebrar lanzamiento de app, Tutorial sobre automatización..."
    rows={4}
    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
    required
  />
  <p className="mt-1 text-xs text-slate-500">
    Describe el tema, mensaje o contexto sobre el cual generar el contenido
  </p>
</div>
```

### 2. **Actualizar TypeScript Interface**

```typescript
export interface CampaignCreateRequest {
  name: string;
  influencer_name: string;
  tone_of_voice: string;
  platforms: string[];
  content_count: number;
  topic: string;  // ✅ NUEVO - REQUERIDO
  scheduled_at?: string | null;
}
```

### 3. **Actualizar Backend Pydantic Model**

```python
class CampaignCreateRequest(BaseModel):
    name: str
    influencer_name: str
    tone_of_voice: str
    platforms: list[str]
    content_count: int
    topic: str  # ✅ NUEVO - REQUERIDO
    scheduled_at: str | None = None
```

### 4. **Actualizar Payload a n8n**

```python
payload = {
    "user_id": user_in_session.id,
    "email": user_in_session.email,
    "campaign_name": campaign.name,
    "influencer": campaign.influencer_name,
    "tone": campaign.tone_of_voice,
    "platforms": campaign.platforms,
    "pieces": campaign.content_count,
    "topic": campaign.topic  # ✅ NUEVO - CRÍTICO para n8n
}
```

### 5. **Validación en Frontend**

```typescript
const handleCreateCampaign = async () => {
  if (!campaignName || !influencerName || !campaignTopic.trim() || selectedPlatforms.length === 0) {
    alert("Por favor completa todos los campos requeridos, incluyendo el tema del contenido");
    return;
  }
  // ... resto del código
};
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Añadir campo `campaignTopic` al estado del componente
- [ ] Añadir textarea al formulario para capturar el tema
- [ ] Actualizar `CampaignCreateRequest` interface en `api-client.ts`
- [ ] Actualizar `CampaignCreateRequest` Pydantic model en `marketing.py`
- [ ] Añadir `topic` al payload de n8n
- [ ] Actualizar validación del formulario
- [ ] Actualizar mensaje de error si falta el tema
- [ ] Probar flujo completo: Frontend → Backend → n8n

---

## 🎯 PRIORIDAD

**🔴 CRÍTICA** - Sin este campo, el sistema no puede generar contenido útil.  
**Tiempo estimado de fix:** 30-45 minutos  
**Riesgo si no se corrige:** 100% de fallos en generación de contenido

---

## 📝 NOTAS ADICIONALES

### Comparación con Content Planner (Monthly Campaign)

El módulo **Content Planner** (línea 69) SÍ tiene campo `campaignThemes`:
```typescript
const [campaignThemes, setCampaignThemes] = useState("");
// Se envía como: themes: campaignThemes.split(",").map(...)
```

Esto sugiere que el campo `topic`/`themes` es necesario y ya existe en otro módulo.  
**Recomendación:** Replicar el patrón de `Content Planner` en `Content Creator`.

---

**Fin del Reporte**

