# 📊 Documentación: Gráficos del Dashboard de Data Mining

## Resumen Total: 12 Gráficos Principales + 3 KPIs

---

## 🎯 SECCIÓN SUPERIOR: KPIs ESTRATÉGICOS

### KPI 1: Viabilidad de Mercado
- **Tipo**: Indicador con barra de progreso
- **Dato**: 78/100
- **Representa**: Índice de viabilidad del mercado objetivo (0-100)
- **Visualización**: Barra de progreso verde con sombra
- **Ubicación**: Grid superior, columna 1

### KPI 2: Potencial Viral
- **Tipo**: Indicador con barras de nivel
- **Dato**: 7.2/10
- **Representa**: Potencial de viralidad del producto/servicio (0-10)
- **Visualización**: 10 barras horizontales (7 llenas, 3 vacías)
- **Ubicación**: Grid superior, columna 2

### KPI 3: Enterprise (Gancho de Venta)
- **Tipo**: CTA (Call to Action)
- **Dato**: Botón de desbloqueo
- **Representa**: Acceso a plan Enterprise para alcanzar 100/100
- **Visualización**: Card con gradiente violeta y botón
- **Ubicación**: Grid superior, columna 3

---

## 📈 SECCIÓN PRINCIPAL: GRÁFICOS ESTRATÉGICOS

### Gráfico 1: Tendencia de Interés
- **Tipo**: AreaChart (Gráfico de área)
- **Datos**: `trendData` - Valores mensuales (Ene-Jun)
- **Representa**: Evolución del interés en el mercado objetivo durante los últimos 6 meses
- **Eje X**: Meses (Ene, Feb, Mar, Abr, May, Jun)
- **Eje Y**: Nivel de interés (0-100)
- **Color**: Violeta (#8b5cf6) con gradiente
- **Ubicación**: Sección principal, columna izquierda (2/3 del ancho)

### Gráfico 2: Sentimiento Social
- **Tipo**: PieChart (Gráfico de dona)
- **Datos**: `sentimentData` - Porcentajes de sentimiento
- **Representa**: Distribución del sentimiento en redes sociales sobre el tema analizado
- **Categorías**:
  - Positivo: 65% (Verde #10b981)
  - Neutral: 25% (Violeta #8b5cf6)
  - Negativo: 10% (Ámbar #f59e0b)
- **Ubicación**: Sección principal, columna derecha (1/3 del ancho)

---

## 🔬 SECCIÓN TÉCNICA: DEEP DATA ANALYSIS

### Gráfico 3: Demografía (Rango de Edades)
- **Tipo**: BarChart horizontal
- **Datos**: `ageData` - Distribución por rangos de edad
- **Representa**: Porcentaje de la audiencia objetivo por rango de edad
- **Categorías**:
  - 18-24: 15%
  - 25-34: 45%
  - 35-44: 25%
  - 45+: 15%
- **Color**: Índigo (#6366f1)
- **Ubicación**: Deep Data Analysis, columna 1

### Componente 4: Live Search Feed
- **Tipo**: Terminal de logs (no es gráfico, es componente de texto)
- **Datos**: Logs en tiempo real de búsquedas
- **Representa**: Actividad en tiempo real del sistema de minería de datos
- **Contenido**: Queries, fuentes, estados de procesamiento
- **Ubicación**: Deep Data Analysis, columna 2

### Componente 5: Latest Reports
- **Tipo**: Lista de archivos JSON (no es gráfico, es componente de lista)
- **Datos**: Archivos de reportes generados
- **Representa**: Historial de análisis completados y en proceso
- **Contenido**: Nombres de archivos, tamaños, estados (READY/PROCESSING)
- **Ubicación**: Deep Data Analysis, columna 3

---

## 📊 SECCIÓN ADICIONAL: ANÁLISIS DEMOGRÁFICO Y SOCIAL (9 Gráficos)

### Gráfico 6: Redes Sociales Más Usadas
- **Tipo**: PieChart (Gráfico de dona)
- **Datos**: `socialMediaData` - Porcentaje de uso por plataforma
- **Representa**: Distribución del uso de redes sociales en la audiencia objetivo
- **Categorías**:
  - Instagram: 42% (Rosa #E4405F)
  - TikTok: 28% (Negro #000000)
  - Twitter: 18% (Azul #1DA1F2)
  - Facebook: 12% (Azul #1877F2)
- **Ubicación**: Grid de 9 gráficos, posición 1

### Gráfico 7: Distribución Geográfica
- **Tipo**: BarChart vertical
- **Datos**: `geographicData` - Porcentaje por país
- **Representa**: Distribución geográfica de la audiencia objetivo
- **Categorías**:
  - España: 35%
  - México: 22%
  - Argentina: 18%
  - Colombia: 15%
  - Chile: 10%
- **Color**: Verde esmeralda (#10b981)
- **Ubicación**: Grid de 9 gráficos, posición 2

### Gráfico 8: Dispositivos Más Usados
- **Tipo**: PieChart (Gráfico de dona)
- **Datos**: `deviceData` - Porcentaje por tipo de dispositivo
- **Representa**: Distribución del uso de dispositivos en la audiencia objetivo
- **Categorías**:
  - Mobile: 68% (Violeta #8b5cf6)
  - Desktop: 24% (Índigo #6366f1)
  - Tablet: 8% (Púrpura #a855f7)
- **Ubicación**: Grid de 9 gráficos, posición 3

### Gráfico 9: Actividad por Horas
- **Tipo**: LineChart (Gráfico de línea)
- **Datos**: `hourlyActivityData` - Nivel de actividad por hora del día
- **Representa**: Patrones de actividad de la audiencia a lo largo del día
- **Eje X**: Horas (00, 06, 12, 18, 21)
- **Eje Y**: Nivel de actividad (0-100)
- **Color**: Azul (#3b82f6)
- **Ubicación**: Grid de 9 gráficos, posición 4

### Gráfico 10: Intereses por Categoría
- **Tipo**: BarChart vertical
- **Datos**: `interestCategoriesData` - Nivel de interés por categoría
- **Representa**: Interés de la audiencia en diferentes categorías temáticas
- **Categorías**:
  - Tecnología: 85%
  - Negocios: 72%
  - Marketing: 58%
  - Diseño: 45%
  - Educación: 32%
- **Color**: Púrpura (#a855f7)
- **Ubicación**: Grid de 9 gráficos, posición 5

### Gráfico 11: Tendencias por Plataforma
- **Tipo**: LineChart multi-línea (3 líneas)
- **Datos**: `platformTrendsData` - Evolución mensual por plataforma
- **Representa**: Evolución del uso de diferentes plataformas sociales a lo largo del tiempo
- **Líneas**:
  - Instagram (Rosa #E4405F)
  - TikTok (Negro #000000)
  - Twitter (Azul #1DA1F2)
- **Eje X**: Meses (Ene, Feb, Mar)
- **Eje Y**: Porcentaje de uso
- **Ubicación**: Grid de 9 gráficos, posición 6

### Gráfico 12: Engagement por Red Social
- **Tipo**: BarChart vertical
- **Datos**: `engagementData` - Tasa de engagement por plataforma
- **Representa**: Nivel de engagement (interacción) promedio en cada red social
- **Categorías**:
  - TikTok: 6.2/10
  - Instagram: 4.8/10
  - Twitter: 3.5/10
  - Facebook: 2.9/10
- **Color**: Verde esmeralda (#10b981)
- **Ubicación**: Grid de 9 gráficos, posición 7

### Gráfico 13: Crecimiento Semanal
- **Tipo**: AreaChart (Gráfico de área)
- **Datos**: `growthData` - Porcentaje de crecimiento semanal
- **Representa**: Tasa de crecimiento del interés/audiencia semana a semana
- **Eje X**: Semanas (W1, W2, W3, W4, W5)
- **Eje Y**: Porcentaje de crecimiento (0-100)
- **Color**: Cyan (#06b6d4) con gradiente
- **Ubicación**: Grid de 9 gráficos, posición 8

### Gráfico 14: Radar de Intereses
- **Tipo**: RadarChart (Gráfico de radar)
- **Datos**: `interestCategoriesData` - Mismo que Gráfico 10
- **Representa**: Análisis multidimensional de intereses de la audiencia
- **Ejes**: Tecnología, Negocios, Marketing, Diseño, Educación
- **Color**: Violeta (#8b5cf6)
- **Ubicación**: Grid de 9 gráficos, posición 9

---

## 📋 RESUMEN POR TIPO DE GRÁFICO

- **AreaChart**: 2 gráficos (Tendencia de Interés, Crecimiento Semanal)
- **PieChart**: 3 gráficos (Sentimiento Social, Redes Sociales, Dispositivos)
- **BarChart**: 4 gráficos (Demografía, Geografía, Intereses, Engagement)
- **LineChart**: 2 gráficos (Actividad por Horas, Tendencias por Plataforma)
- **RadarChart**: 1 gráfico (Radar de Intereses)
- **Componentes de texto**: 2 (Live Feed, Latest Reports)
- **KPIs**: 3 indicadores (Viabilidad, Viralidad, Enterprise)

---

## 🎨 PALETA DE COLORES UTILIZADA

- **Verde Esmeralda** (#10b981): Sentimiento positivo, Engagement, Geografía
- **Violeta** (#8b5cf6): Tendencia principal, Demografía, Radar
- **Ámbar** (#f59e0b): Sentimiento negativo, Dispositivos
- **Azul** (#3b82f6): Actividad por horas
- **Cyan** (#06b6d4): Crecimiento semanal
- **Rosa** (#E4405F): Instagram
- **Negro** (#000000): TikTok
- **Azul Twitter** (#1DA1F2): Twitter
- **Azul Facebook** (#1877F2): Facebook

---

## 📍 ESTRUCTURA DEL DASHBOARD

1. **Header**: Título y botón "Nuevo Análisis"
2. **KPIs Grid**: 3 indicadores estratégicos
3. **Gráficos Principales**: 2 gráficos grandes (Tendencia + Sentimiento)
4. **Deep Data Analysis**: 3 columnas (Demografía, Live Feed, Reports)
5. **Análisis Demográfico y Social**: Grid de 9 gráficos (3x3)
6. **Footer**: Fuentes de datos (Twitter API, Google Trends, Brave Search)

---

**Total de visualizaciones de datos**: 12 gráficos + 3 KPIs + 2 componentes informativos = 17 elementos visuales

