/**
 * API Client - Cliente Centralizado para Peticiones al Backend
 * 
 * Este módulo proporciona una capa de abstracción para todas las peticiones HTTP
 * al backend FastAPI. Elimina la necesidad de hardcodear URLs, headers de autorización
 * y lógica de manejo de errores en cada componente.
 * 
 * Características:
 * - Inyección automática de token de autorización
 * - Manejo centralizado de errores
 * - Redirección automática a /login en 401
 * - Base URL desde variable de entorno
 * - Tipado estricto con TypeScript
 * 
 * IMPORTANTE: NUNCA hardcodear URLs. Usar siempre process.env.NEXT_PUBLIC_API_URL
 */

import Cookies from "js-cookie";

/**
 * Error personalizado para errores de API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Estado de un servicio individual
 */
export interface ServiceStatus {
  name: string;
  status: "up" | "down" | "degraded";
  latency_ms?: number;
  error?: string;
}

/**
 * Respuesta del health check del sistema
 */
export interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  services: {
    database?: ServiceStatus;
    redis?: ServiceStatus;
    worker?: ServiceStatus;
    ai_engine?: ServiceStatus;
  };
}

/**
 * Obtiene el estado de salud del sistema
 * 
 * @returns Estado de salud de todos los servicios
 * @throws ApiError si falla la petición
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  return apiPublic<SystemHealth>("/api/v1/health", {
    throwOnError: false
  });
}

/**
 * Content Creator API Functions
 */

export interface CampaignCreateRequest {
  name: string;
  influencer_name: string;
  tone_of_voice: string;
  platforms: string[];
  content_count: number;
  topic: string;  // Tema o contexto de la campaña - REQUERIDO
  scheduled_at?: string | null;
}

export interface CampaignResponse {
  id: number;
  user_id: number;
  name: string;
  influencer_name: string;
  tone_of_voice: string;
  platforms: string[];
  content_count: number;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  generated_content: Record<string, any> | null;
  error_message: string | null;
  arq_job_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CampaignJobStatusResponse {
  campaign_id: number;
  job_id: string | null;
  job_status: "queued" | "in_progress" | "complete" | "failed" | null;
  campaign_status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  progress: number | null;
  result: Record<string, any> | null;
  error: string | null;
}

export interface CampaignCreatedResponse {
  campaign_id: number;
  status: string;
  message: string;
  estimated_completion: string | null;
}

export interface CampaignListResponse {
  campaigns: CampaignResponse[];
  total: number;
}

/**
 * Crear una nueva campaña de contenido
 * 
 * @param data - Datos de la campaña
 * @returns Respuesta con ID de la campaña creada
 * @throws ApiError si falla la petición (402 si no hay créditos suficientes)
 */
export async function createCampaign(
  data: CampaignCreateRequest
): Promise<CampaignCreatedResponse> {
  // Usar el nuevo endpoint de marketing que gestiona créditos
  return apiPost<CampaignCreatedResponse>("/api/v1/marketing/create-campaign", data);
}

/**
 * Obtener lista de campañas del usuario
 * 
 * @param limit - Número máximo de resultados
 * @param offset - Offset para paginación
 * @returns Lista de campañas
 * @throws ApiError si falla la petición
 */
export async function getCampaigns(
  limit: number = 50,
  offset: number = 0
): Promise<CampaignListResponse> {
  return apiGet<CampaignListResponse>(
    `/api/v1/content/campaigns?limit=${limit}&offset=${offset}`
  );
}

/**
 * Obtener una campaña específica
 * 
 * @param campaignId - ID de la campaña
 * @returns Detalles de la campaña
 * @throws ApiError si falla la petición
 */
export async function getCampaign(campaignId: number): Promise<CampaignResponse> {
  return apiGet<CampaignResponse>(`/api/v1/content/campaigns/${campaignId}`);
}

/**
 * Obtener el estado del job de Arq para una campaña
 * 
 * @param campaignId - ID de la campaña
 * @returns Estado del job y progreso
 * @throws ApiError si falla la petición
 */
export async function getCampaignJobStatus(
  campaignId: number
): Promise<CampaignJobStatusResponse> {
  return apiGet<CampaignJobStatusResponse>(
    `/api/v1/content/campaigns/${campaignId}/job-status`
  );
}

/**
 * Data Mining API Functions
 */

export interface ExtractionQueryCreateRequest {
  search_topic: string;
  query_metadata?: Record<string, any> | null;
}

export interface ExtractionQueryResponse {
  id: number;
  user_id: number;
  search_topic: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  results: Record<string, any> | null;
  error_message: string | null;
  arq_job_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  query_metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
}

export interface ExtractionQueryStatusResponse {
  query_id: number;
  job_id: string | null;
  job_status: "queued" | "in_progress" | "complete" | "failed" | null;
  query_status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  progress: number | null;
  result: Record<string, any> | null;
  error: string | null;
}

export interface ExtractionQueryResultsResponse {
  query_id: number;
  search_topic: string;
  results: Record<string, any>;
  completed_at: string | null;
  query_metadata: Record<string, any> | null;
}

export interface LaunchQueryResponse {
  query_id: number;
  status: string;
  message: string;
  estimated_completion: string | null;
}

export interface ExtractionQueryListResponse {
  queries: ExtractionQueryResponse[];
  total: number;
}

/**
 * Lanzar una nueva query de extracción de datos
 * 
 * @param data - Datos de la query
 * @returns Respuesta con ID de la query creada
 * @throws ApiError si falla la petición
 */
export async function launchExtractionQuery(
  data: ExtractionQueryCreateRequest
): Promise<LaunchQueryResponse> {
  return apiPost<LaunchQueryResponse>("/api/v1/data-mining/launch-query", data);
}

/**
 * Obtener lista de queries de extracción del usuario
 * 
 * @param limit - Número máximo de resultados
 * @param offset - Offset para paginación
 * @returns Lista de queries
 * @throws ApiError si falla la petición
 */
export async function getExtractionQueries(
  limit: number = 50,
  offset: number = 0
): Promise<ExtractionQueryListResponse> {
  return apiGet<ExtractionQueryListResponse>(
    `/api/v1/data-mining/queries?limit=${limit}&offset=${offset}`
  );
}

/**
 * Obtener una query específica
 * 
 * @param queryId - ID de la query
 * @returns Detalles de la query
 * @throws ApiError si falla la petición
 */
export async function getExtractionQuery(queryId: number): Promise<ExtractionQueryResponse> {
  return apiGet<ExtractionQueryResponse>(`/api/v1/data-mining/queries/${queryId}`);
}

/**
 * Obtener el estado del job de Arq para una query
 * 
 * @param queryId - ID de la query
 * @returns Estado del job y progreso
 * @throws ApiError si falla la petición
 */
export async function getExtractionQueryStatus(
  queryId: number
): Promise<ExtractionQueryStatusResponse> {
  return apiGet<ExtractionQueryStatusResponse>(
    `/api/v1/data-mining/queries/${queryId}/status`
  );
}

/**
 * Obtener los resultados estructurados de una query completada
 * 
 * @param queryId - ID de la query
 * @returns Resultados estructurados (JSONB) de la extracción
 * @throws ApiError si falla la petición o la query no está completada
 */
export async function getExtractionQueryResults(
  queryId: number
): Promise<ExtractionQueryResultsResponse> {
  return apiGet<ExtractionQueryResultsResponse>(
    `/api/v1/data-mining/queries/${queryId}/results`
  );
}

/**
 * Content Planner API Functions
 */

export interface ContentCampaignCreateRequest {
  month: string; // Format: "YYYY-MM"
  tone_of_voice: string;
  themes: string[];
  target_platforms: string[];
  campaign_metadata?: Record<string, any>;
  scheduled_at?: string | null;
}

export interface ContentCampaignResponse {
  id: number;
  user_id: number;
  month: string;
  tone_of_voice: string;
  themes: string[];
  target_platforms: string[];
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  generated_content: Record<string, any> | null;
  error_message: string | null;
  arq_job_id: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  campaign_metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
}

export interface LaunchCampaignResponse {
  campaign_id: number;
  status: string;
  message: string;
  estimated_completion: string | null;
}

export interface ContentCampaignListResponse {
  campaigns: ContentCampaignResponse[];
  total: number;
}

/**
 * Lanzar una campaña de contenido mensual (4 Posts + 1 Reel)
 * 
 * @param data - Datos de la campaña mensual
 * @returns Respuesta con ID de la campaña creada
 * @throws ApiError si falla la petición
 */
export async function launchMonthlyCampaign(
  data: ContentCampaignCreateRequest
): Promise<LaunchCampaignResponse> {
  return apiPost<LaunchCampaignResponse>("/api/v1/content-planner/launch-monthly-campaign", data);
}

/**
 * Obtener lista de campañas mensuales del usuario
 * 
 * @param limit - Número máximo de resultados
 * @param offset - Offset para paginación
 * @returns Lista de campañas
 * @throws ApiError si falla la petición
 */
export async function getMonthlyCampaigns(
  limit: number = 50,
  offset: number = 0
): Promise<ContentCampaignListResponse> {
  return apiGet<ContentCampaignListResponse>(
    `/api/v1/content-planner/campaigns?limit=${limit}&offset=${offset}`
  );
}

/**
 * Obtener una campaña mensual específica
 * 
 * @param campaignId - ID de la campaña
 * @returns Detalles de la campaña
 * @throws ApiError si falla la petición
 */
export async function getMonthlyCampaign(campaignId: number): Promise<ContentCampaignResponse> {
  return apiGet<ContentCampaignResponse>(`/api/v1/content-planner/campaigns/${campaignId}`);
}

export interface CampaignStatusResponse {
  campaign_id: number;
  job_id: string | null;
  job_status: "queued" | "in_progress" | "complete" | "failed" | null;
  campaign_status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  progress: number | null;
  result: Record<string, any> | null;
  error: string | null;
}

/**
 * Obtener el estado del job de Arq para una campaña mensual
 * 
 * @param campaignId - ID de la campaña
 * @returns Estado del job y de la campaña
 * @throws ApiError si falla la petición
 */
export async function getCampaignStatus(campaignId: number): Promise<CampaignStatusResponse> {
  return apiGet<CampaignStatusResponse>(`/api/v1/content-planner/campaigns/${campaignId}/status`);
}

/**
 * Opciones para peticiones autenticadas
 */
export interface FetchOptions extends RequestInit {
  /**
   * Si es true, requiere autenticación (inyecta token automáticamente)
   * Si es false, hace petición pública sin token
   * Por defecto: true
   */
  requireAuth?: boolean;
  
  /**
   * Si es true, lanza error si la respuesta no es 200-299
   * Si es false, retorna la respuesta sin validar status
   * Por defecto: true
   */
  throwOnError?: boolean;
}

/**
 * Obtiene la URL base del API desde las variables de entorno
 * 
 * @returns URL base del API
 * @throws Error si NEXT_PUBLIC_API_URL no está definida en producción
 */
function getBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // En producción, la variable DEBE estar definida
  if (process.env.NODE_ENV === "production" && !apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required in production. " +
      "Please set it in your environment variables."
    );
  }
  
  // En desarrollo, usar localhost como fallback
  return apiUrl || "http://localhost:8000";
}

/**
 * Obtiene el token de autenticación desde las cookies
 * 
 * @returns Token JWT o null si no existe
 */
function getAuthToken(): string | null {
  // Intentar obtener de cookies primero (más seguro para SSR)
  if (typeof window !== "undefined") {
    return Cookies.get("bai_token") || null;
  }
  return null;
}

/**
 * Maneja errores de autenticación (401) redirigiendo a login
 * 
 * @param status - Código de estado HTTP
 */
function handleAuthError(status: number): void {
  if (status === 401 && typeof window !== "undefined") {
    // Limpiar token
    Cookies.remove("bai_token");
    
    // Redirigir a login
    window.location.href = "/login";
  }
}

/**
 * Realiza una petición HTTP con autenticación automática
 * 
 * Esta función:
 * 1. Construye la URL completa usando getApiUrl()
 * 2. Inyecta automáticamente el header Authorization si requireAuth es true
 * 3. Maneja errores de forma consistente
 * 4. Lanza ApiError si throwOnError es true y la respuesta no es exitosa
 * 
 * @param endpoint - Ruta del endpoint (ej: "/api/chat", "/api/data/logs")
 * @param options - Opciones de fetch y configuración del cliente
 * @returns Promise con la respuesta parseada como JSON
 * @throws {ApiError} Si la petición falla y throwOnError es true
 * 
 * @example
 * ```ts
 * // Petición autenticada (por defecto)
 * const data = await fetchWithAuth("/api/chat", {
 *   method: "POST",
 *   body: JSON.stringify({ text: "Hello" })
 * });
 * 
 * // Petición pública (sin autenticación)
 * const health = await fetchWithAuth("/health", {
 *   requireAuth: false
 * });
 * 
 * // Petición que no lanza error en 404
 * const result = await fetchWithAuth("/api/data", {
 *   throwOnError: false
 * });
 * ```
 */
export async function fetchWithAuth<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    requireAuth = true,
    throwOnError = true,
    headers = {},
    ...fetchOptions
  } = options;

  // Construir URL completa
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith("http") 
    ? endpoint 
    : `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Preparar headers
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // Inyectar token de autenticación si es requerido
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    } else {
      // Si requiere auth pero no hay token, lanzar error
      if (throwOnError) {
        throw new ApiError(
          "Authentication required. Please log in.",
          401
        );
      }
    }
  }

  // Realizar petición
  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });
  } catch (error) {
    // Error de red (sin conexión, timeout, etc.)
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0,
      error
    );
  }

  // Manejar errores de respuesta
  if (throwOnError && !response.ok) {
    // Si es 401, manejar autenticación automáticamente
    if (response.status === 401) {
      handleAuthError(401);
    }
    
    let errorData: unknown;
    try {
      errorData = await response.json().catch(() => null);
    } catch {
      errorData = await response.text().catch(() => null);
    }

    throw new ApiError(
      (errorData as { detail?: string })?.detail || 
      `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  // Si la respuesta está vacía (204 No Content, etc.)
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  // Parsear y retornar JSON
  try {
    return await response.json();
  } catch (error) {
    // Si no es JSON válido, retornar texto
    const text = await response.text();
    return text as unknown as T;
  }
}

/**
 * Métodos de conveniencia para peticiones comunes
 */

/**
 * GET request autenticada
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options?: Omit<FetchOptions, "method">
): Promise<T> {
  return fetchWithAuth<T>(endpoint, {
    ...options,
    method: "GET",
  });
}

/**
 * POST request autenticada
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<T> {
  return fetchWithAuth<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request autenticada
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<T> {
  return fetchWithAuth<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request autenticada
 */
export async function apiDelete<T = unknown>(
  endpoint: string,
  options?: Omit<FetchOptions, "method">
): Promise<T> {
  return fetchWithAuth<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
}

/**
 * Petición pública (sin autenticación)
 * Útil para endpoints públicos como /health, /api/v1/widget/chat, etc.
 */
export async function apiPublic<T = unknown>(
  endpoint: string,
  options?: Omit<FetchOptions, "requireAuth">
): Promise<T> {
  return fetchWithAuth<T>(endpoint, {
    ...options,
    requireAuth: false,
  });
}

