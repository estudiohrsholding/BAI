# 🏭 Guía Completa: Workflow n8n para Generación de Contenido

**Objetivo:** Configurar el workflow en n8n que procesa las campañas de marketing y genera contenido (imágenes/videos) usando IA.

---

## 📋 PREREQUISITOS

### 1. Endpoints del Backend Disponibles

- ✅ `POST /api/v1/marketing/create-campaign` - Crea campaña (llamado desde frontend)
- ✅ `POST /api/v1/marketing/campaign/{campaign_id}/save-plan` - Guarda plan de contenido
- ✅ `POST /api/v1/marketing/public/content/{piece_id}/update-media` - Actualiza media URL (webhooks externos)

### 2. Variables de Entorno en n8n

Configura estas variables en n8n (Settings → Environment Variables):

```
BAI_API_URL=https://api.baibussines.com
N8N_SERVICE_API_KEY=tu_api_key_secreta_muy_larga
FAL_API_KEY=tu_fal_ai_key (recomendado)
PIAPI_API_KEY=tu_api_key_de_piapi (opcional, alternativo)
BLOTATO_API_KEY=tu_api_key_de_blotato (opcional)
GEMINI_API_KEY=tu_gemini_key (para generar el plan)
```

**⚠️ IMPORTANTE:** La `N8N_SERVICE_API_KEY` debe ser la misma en el backend y en n8n.

---

## 🔄 FLUJO COMPLETO DEL WORKFLOW

```
Webhook Trigger (recibe campaña)
  ↓
Generar Plan de Contenido (Gemini)
  ↓
Guardar Plan en DB (POST /save-plan)
  ↓
Loop Over Items (procesar cada pieza)
  ↓
Switch (separar Imagen vs Video)
  ↓
[Imagen] → PiAPI/Midjourney → Update DB
  ↓
[Video] → Blotato/PiAPI → Update DB
```

---

## 📝 PASO A PASO: CONFIGURACIÓN EN N8N

### **NODO 1: Webhook Trigger**

**Tipo:** Webhook  
**Nombre:** `marketing-campaign-trigger`

**Configuración:**
- **HTTP Method:** POST
- **Path:** `marketing-campaign-trigger`
- **Response Mode:** Respond When Last Node Finishes

**Datos que recibe:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "campaign_id": 123,
  "campaign_name": "Campaña Q1 2025",
  "influencer": "TechGuru_AI",
  "tone": "profesional",
  "platforms": ["Instagram", "TikTok"],
  "pieces": 10,
  "topic": "Promocionar nuevas zapatillas de running..."
}
```

---

### **NODO 2: Generar Plan de Contenido (Gemini)**

**Tipo:** HTTP Request  
**Nombre:** `Generate Content Plan`

**Configuración:**
- **Method:** POST
- **URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={{$env.GEMINI_API_KEY}}`
- **Authentication:** None (API key en URL)
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
```json
{
  "contents": [{
    "parts": [{
      "text": "Genera un plan de contenido para una campaña de marketing.\n\nCampaña: {{ $json.campaign_name }}\nInfluencer: {{ $json.influencer }}\nTono: {{ $json.tone }}\nPlataformas: {{ $json.platforms.join(', ') }}\nTema: {{ $json.topic }}\nCantidad de piezas: {{ $json.pieces }}\n\nGenera un JSON con un array de objetos. Cada objeto debe tener:\n- platform: string (Instagram, TikTok, YouTube, Twitter)\n- type: string (Post, Reel, Story, Video)\n- caption: string (texto del caption)\n- visual_script: string (descripción visual para generar imagen/video)\n\nResponde SOLO con el JSON, sin markdown, sin explicaciones."
    }]
  }]
}
```

**Post-Processing:**
- **Response Format:** JSON
- **Extract JSON:** Sí (extraer el campo `candidates[0].content.parts[0].text`)

**Nota:** Puede que necesites un nodo "Code" después para parsear el JSON de la respuesta de Gemini.

---

### **NODO 3: Parsear JSON del Plan**

**Tipo:** Code  
**Nombre:** `Parse Content Plan`

**Código (JavaScript):**
```javascript
// Extraer el texto de la respuesta de Gemini
const geminiResponse = $input.item.json;
const textContent = geminiResponse.candidates[0].content.parts[0].text;

// Limpiar el texto (quitar markdown si existe)
const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

// Parsear el JSON
let contentPlan;
try {
  contentPlan = JSON.parse(cleanJson);
} catch (e) {
  // Si falla, intentar extraer solo el array si está envuelto en otro objeto
  const parsed = JSON.parse(cleanJson);
  contentPlan = Array.isArray(parsed) ? parsed : parsed.pieces || parsed.content || [];
}

// Asegurar que contentPlan es un array
if (!Array.isArray(contentPlan)) {
  throw new Error("El plan de contenido debe ser un array");
}

// Retornar el plan junto con los datos originales de la campaña
// IMPORTANTE: Devolver un objeto con la clave "pieces" que contiene el array
return {
  json: {
    campaign_id: $input.item.json.campaign_id || $('Webhook').item.json.campaign_id,
    user_id: $input.item.json.user_id || $('Webhook').item.json.user_id,
    pieces: contentPlan  // Array de piezas de contenido
  }
};
```

---

### **NODO 4: Guardar Plan en Base de Datos**

**Tipo:** HTTP Request  
**Nombre:** `Save Plan to DB`

**Configuración:**
- **Method:** POST
- **URL:** `{{ $env.BAI_API_URL }}/api/v1/marketing/public/campaign/{{ $json.campaign_id }}/save-plan`
- **Authentication:** None
- **Headers:**
  ```
  Content-Type: application/json
  X-API-Key: {{ $env.N8N_SERVICE_API_KEY }}
  ```
- **Body (JSON):**
```json
{
  "pieces": {{ JSON.stringify($json.pieces) }}
}
```

**⚠️ IMPORTANTE:** 
- El body DEBE ser un objeto JSON con la clave `"pieces"` que contiene un array
- NO envíes el array directamente: `[...]` ❌
- SÍ envía un objeto: `{ "pieces": [...] }` ✅
- En n8n, usa `JSON.stringify()` para asegurar que el array se serialice correctamente

**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Plan guardado exitosamente. 10 piezas creadas.",
  "piece_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "campaign_id": 123
}
```

---

### **NODO 5: Loop Over Items (Split In Batches)**

**Tipo:** Split In Batches  
**Nombre:** `Process Each Piece`

**Configuración:**
- **Batch Size:** 1
- **Options:**
  - **Reset:** No
  - **Keep Only Set Items:** Sí

**Input:** El array `pieces` del plan, pero necesitas combinarlo con `piece_ids` de la respuesta anterior.

**Nota:** Puede que necesites un nodo "Code" antes para combinar `pieces` con `piece_ids`:

```javascript
const pieces = $('Parse Content Plan').item.json.pieces;
const pieceIds = $('Save Plan to DB').item.json.piece_ids;

// Combinar pieces con sus IDs
const combined = pieces.map((piece, index) => ({
  ...piece,
  id: pieceIds[index],
  campaign_id: $('Save Plan to DB').item.json.campaign_id
}));

return combined.map(item => ({ json: item }));
```

---

### **NODO 6: Switch (Router)**

**Tipo:** Switch  
**Nombre:** `Route by Type`

**Configuración:**

**Regla 1: Imagen**
- **Condition:** String
- **Value 1:** `{{ $json.type }}`
- **Operation:** Contains
- **Value 2:** `Post` OR `Imagen` OR `Story` (si Story es imagen)

**Regla 2: Video**
- **Condition:** String
- **Value 1:** `{{ $json.type }}`
- **Operation:** Contains
- **Value 2:** `Reel` OR `Video` OR `TikTok`

**Output 1:** Conecta a "Generate Image"  
**Output 2:** Conecta a "Generate Video"

---

### **NODO 7A: Generar Imagen (Fal.ai / PiAPI)**

**Tipo:** HTTP Request  
**Nombre:** `Generate Image - Fal.ai`

**Configuración (Fal.ai - Recomendado):**
- **Method:** POST
- **URL:** `https://fal.run/fal-ai/flux-pro/v1.1`
- **Authentication:** Header
  - **Name:** `Authorization`
  - **Value:** `Key {{ $env.FAL_API_KEY }}`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
```json
{
  "prompt": "{{ $json.visual_script }}",
  "image_size": "landscape_4_3",
  "webhook_url": "{{ $env.BAI_API_URL }}/api/v1/marketing/public/content/{{ $json.id }}/update-media",
  "webhook_secret": "{{ $env.N8N_SERVICE_API_KEY }}"
}
```

**Configuración Alternativa (PiAPI/Midjourney):**
- **Method:** POST
- **URL:** `https://api.piapi.ai/midjourney/v2/imagine`
- **Authentication:** Header
  - **Name:** `x-api-key`
  - **Value:** `{{ $env.PIAPI_API_KEY }}`
- **Body (JSON):**
```json
{
  "prompt": "{{ $json.visual_script }} --ar 4:5 --v 6.0",
  "webhook_url": "{{ $env.BAI_API_URL }}/api/v1/marketing/public/content/{{ $json.id }}/update-media"
}
```

**⚠️ IMPORTANTE - Webhook de Fal.ai:**

Fal.ai enviará el callback directamente a tu backend cuando la imagen esté lista. El endpoint `/public/content/{piece_id}/update-media` es un **Adaptador Universal** que entiende múltiples formatos:

- ✅ `{ "images": [{ "url": "..." }] }` (Fal.ai)
- ✅ `{ "video": { "url": "..." } }` (Fal.ai)
- ✅ `{ "media_url": "..." }` (Genérico)
- ✅ Cualquier JSON con una URL válida (búsqueda recursiva)

**No necesitas crear un webhook intermedio en n8n.** Fal.ai llama directamente al backend.

---

### **NODO 7B: Generar Video (Fal.ai / Blotato / PiAPI)**

**Tipo:** HTTP Request  
**Nombre:** `Generate Video - Fal.ai`

**Configuración (Fal.ai - Recomendado):**
- **Method:** POST
- **URL:** `https://fal.run/fal-ai/fast-svd`
- **Authentication:** Header
  - **Name:** `Authorization`
  - **Value:** `Key {{ $env.FAL_API_KEY }}`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
```json
{
  "image_url": "{{ $json.visual_script }}",
  "webhook_url": "{{ $env.BAI_API_URL }}/api/v1/marketing/public/content/{{ $json.id }}/update-media",
  "webhook_secret": "{{ $env.N8N_SERVICE_API_KEY }}"
}
```

**Configuración Alternativa (Blotato - Talking Head):**
- **Method:** POST
- **URL:** `https://api.blotato.com/v1/videos/generate`
- **Authentication:** Bearer Token
  - **Token:** `{{ $env.BLOTATO_API_KEY }}`
- **Body (JSON):**
```json
{
  "avatar_id": "tu_avatar_id",
  "script": "{{ $json.caption }}",
  "background": "{{ $json.visual_script }}",
  "webhook_url": "{{ $env.BAI_API_URL }}/api/v1/marketing/public/content/{{ $json.id }}/update-media"
}
```

**Configuración Alternativa (PiAPI - Kling/Runway):**
- **Method:** POST
- **URL:** `https://api.piapi.ai/kling/v1/generate`
- **Body (JSON):**
```json
{
  "prompt": "{{ $json.visual_script }}",
  "duration": 10,
  "webhook_url": "{{ $env.BAI_API_URL }}/api/v1/marketing/public/content/{{ $json.id }}/update-media"
}
```

**⚠️ IMPORTANTE - Webhook de Fal.ai:**

Fal.ai enviará el callback directamente a tu backend cuando el video esté listo. El endpoint es un **Adaptador Universal** que entiende:
- ✅ `{ "video": { "url": "..." } }` (Fal.ai)
- ✅ `{ "media_url": "..." }` (Genérico)
- ✅ Cualquier formato (búsqueda recursiva)

---

### **⚠️ NOTA: Webhook Directo (Fal.ai)**

**Con Fal.ai, NO necesitas los nodos 8 y 9.** Fal.ai llama directamente al endpoint del backend:

```
{{ $env.BAI_API_URL }}/api/v1/marketing/public/content/{{ $json.id }}/update-media
```

El backend es un **Adaptador Universal** que:
- ✅ Acepta cualquier formato de callback de Fal.ai
- ✅ Extrae la URL automáticamente
- ✅ Actualiza la base de datos

**Si usas otro proveedor que requiere webhook intermedio:**

### **NODO 8: Webhook de Respuesta (Media Ready) - OPCIONAL**

Solo necesario si tu proveedor no puede llamar directamente al backend.

**Tipo:** Webhook  
**Nombre:** `media-ready`

**Configuración:**
- **HTTP Method:** POST
- **Path:** `media-ready`
- **Query Parameters:** `piece_id` (opcional, puede venir en body)

### **NODO 9: Actualizar Media en Base de Datos - OPCIONAL**

Solo necesario si usas webhook intermedio.

**Tipo:** HTTP Request  
**Nombre:** `Update Media URL`

**Configuración:**
- **Method:** PATCH
- **URL:** `{{ $env.BAI_API_URL }}/api/v1/marketing/public/content/{{ $json.piece_id || $query.piece_id }}/update-media`
- **Authentication:** None
- **Headers:**
  ```
  Content-Type: application/json
  X-API-Key: {{ $env.N8N_SERVICE_API_KEY }}
  ```
- **Body (JSON):**
```json
{
  "media_url": "{{ $json.media_url }}"
}
```

**O simplemente reenvía el payload completo** (el adaptador lo procesará):
- **Body (JSON):** `{{ $json }}`

---

## ✅ AUTENTICACIÓN: Endpoints Públicos Implementados

**✅ RESUELTO:** Se han creado endpoints públicos con autenticación por API key:

- `POST /api/v1/marketing/public/campaign/{campaign_id}/save-plan`
- `POST /api/v1/marketing/public/content/{piece_id}/update-media`

**Configuración requerida:**

1. **Variable de entorno en backend:**
   ```bash
   N8N_SERVICE_API_KEY=tu_api_key_secreta_muy_larga
   ```

2. **Variable de entorno en n8n:**
   ```
   N8N_SERVICE_API_KEY=tu_api_key_secreta_muy_larga
   ```

3. **Header en todas las peticiones desde n8n:**
   ```
   X-API-Key: {{ $env.N8N_SERVICE_API_KEY }}
   ```

**Seguridad:**
- Los endpoints públicos validan la API key antes de procesar
- No requieren autenticación de usuario (JWT)
- La API key debe ser una cadena larga y segura (mínimo 32 caracteres)

---

## 🔧 CONFIGURACIÓN ADICIONAL

### Variables de Entorno en n8n

```
BAI_API_URL=https://api.baibussines.com
N8N_SERVICE_API_KEY=tu_api_key_secreta_muy_larga
PIAPI_API_KEY=tu_piapi_key
BLOTATO_API_KEY=tu_blotato_key
GEMINI_API_KEY=tu_gemini_key
```

### Headers para Llamadas al Backend

**Obligatorio en todos los endpoints públicos:**
```
X-API-Key: {{ $env.N8N_SERVICE_API_KEY }}
Content-Type: application/json
```

**Generar una API key segura:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📊 ESTRUCTURA DE DATOS ESPERADA

### Input del Webhook (create-campaign):
```json
{
  "user_id": 1,
  "campaign_id": 123,
  "campaign_name": "Campaña Q1",
  "influencer": "TechGuru",
  "tone": "profesional",
  "platforms": ["Instagram", "TikTok"],
  "pieces": 10,
  "topic": "Promocionar zapatillas..."
}
```

### Output del Plan (Gemini):
```json
[
  {
    "platform": "Instagram",
    "type": "Reel",
    "caption": "¡Nuevas zapatillas de running! 🏃‍♂️",
    "visual_script": "Un atleta corriendo en un parque al amanecer, zapatillas destacadas"
  },
  {
    "platform": "TikTok",
    "type": "Video",
    "caption": "Review de las nuevas zapatillas",
    "visual_script": "Unboxing de las zapatillas, mostrando características"
  }
]
```

### Request a save-plan:
```json
{
  "pieces": [
    {
      "platform": "Instagram",
      "type": "Reel",
      "caption": "...",
      "visual_script": "..."
    }
  ]
}
```

### Request a update-media:
```json
{
  "media_url": "https://cdn.example.com/video_123.mp4"
}
```

---

## 🔧 TROUBLESHOOTING

### Error 422: "Input should be a valid dictionary or object"

**Causa:** El body del request no tiene el formato correcto. Pydantic espera un objeto con la clave `"pieces"`, pero está recibiendo un array directamente.

**Solución:**

1. **Verifica el nodo "Parse Content Plan":**
   - Debe devolver: `{ "pieces": [...] }`
   - NO debe devolver: `[...]` (array suelto)

2. **Verifica el nodo HTTP Request "Save Plan to DB":**
   - Body debe ser: `{ "pieces": {{ $json.pieces }} }`
   - NO debe ser: `{{ $json.pieces }}` (array suelto)

3. **Solución alternativa con nodo Code intermedio:**
   
   Añade un nodo **Code** entre "Parse Content Plan" y "Save Plan to DB":
   
   **Nombre:** `Prepare Request Body`
   
   **Código:**
   ```javascript
   const pieces = $input.item.json.pieces;
   const campaignId = $input.item.json.campaign_id;
   
   // Asegurar que pieces es un array
   if (!Array.isArray(pieces)) {
     throw new Error("pieces debe ser un array");
   }
   
   return {
     json: {
       campaign_id: campaignId,
       request_body: {
         pieces: pieces
       }
     }
   };
   ```
   
   Luego en el HTTP Request:
   - **Body (JSON):** `{{ $json.request_body }}`

### Error 401: "Invalid or missing API key"

**Causa:** La API key no está configurada o es incorrecta.

**Solución:**
1. Verifica que `N8N_SERVICE_API_KEY` esté configurada en n8n (Environment Variables)
2. Verifica que el header `X-API-Key` esté presente en el request
3. Verifica que la misma key esté configurada en el backend (`N8N_SERVICE_API_KEY` en .env)

### Error 404: "Campaña con ID X no encontrada"

**Causa:** El `campaign_id` no existe en la base de datos.

**Solución:**
1. Verifica que la campaña se haya creado correctamente desde el frontend
2. Verifica que el `campaign_id` en el webhook coincida con el ID real de la campaña
3. Revisa los logs del backend para ver qué `campaign_id` se está recibiendo

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear endpoints públicos con API key para n8n
- [ ] Configurar variables de entorno en n8n
- [ ] Crear workflow en n8n siguiendo esta guía
- [ ] Probar con una campaña de prueba
- [ ] Verificar que las piezas se guardan en DB
- [ ] Verificar que los media URLs se actualizan correctamente
- [ ] Configurar webhooks de respuesta de PiAPI/Blotato
- [ ] Manejar errores y timeouts

---

**Fin de la Guía**

