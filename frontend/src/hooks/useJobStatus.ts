/**
 * useJobStatus Hook - Polling Inteligente con SWR
 * 
 * Hook personalizado para monitorear el estado de jobs de Arq con polling condicional.
 * Solo hace polling cuando el job está activo (queued, in_progress).
 * Cuando está completado o fallido, detiene el polling automáticamente.
 * 
 * Beneficios:
 * - Reduce requests innecesarias (solo poll cuando hay actividad)
 * - Mejor rendimiento (menos carga en servidor)
 * - Mejor UX (actualización automática solo cuando es necesario)
 * - Menos consumo de batería en móviles
 */

import useSWR from 'swr';
import { useCallback, useEffect } from 'react';

export interface JobStatus {
  job_status?: "queued" | "in_progress" | "complete" | "failed" | null;
  campaign_status?: string | null;
  query_status?: string | null;
  progress?: number | null;
  [key: string]: any;
}

interface UseJobStatusOptions {
  /**
   * Función que obtiene el estado del job (ej: getCampaignStatus, getExtractionQueryStatus)
   */
  fetcher: (id: number) => Promise<JobStatus>;
  
  /**
   * ID del job/campaign/query a monitorear
   */
  jobId: number;
  
  /**
   * Intervalo de polling en milisegundos cuando el job está activo
   * @default 5000 (5 segundos)
   */
  pollInterval?: number;
  
  /**
   * Callback opcional cuando el estado se actualiza
   */
  onStatusUpdate?: (status: JobStatus) => void;
  
  /**
   * Si es true, deshabilita el polling completamente
   * @default false
   */
  disabled?: boolean;
}

/**
 * Determina si un job está activo (debe seguir haciendo polling)
 */
function isJobActive(status: JobStatus | null | undefined): boolean {
  if (!status) return false;
  
  const jobStatus = (status.job_status || "").toLowerCase();
  const entityStatus = (status.campaign_status || status.query_status || "").toLowerCase();
  
  const activeStatuses = ["queued", "in_progress", "pending", "running"];
  
  return (
    activeStatuses.includes(jobStatus) ||
    activeStatuses.includes(entityStatus)
  );
}

/**
 * Hook para monitorear el estado de un job con polling inteligente
 */
export function useJobStatus({
  fetcher,
  jobId,
  pollInterval = 5000,
  onStatusUpdate,
  disabled = false,
}: UseJobStatusOptions) {
  
  // Key única para este job
  const swrKey = disabled || !jobId ? null : `job-status-${jobId}`;
  
  // Función de fetch para SWR
  const swrFetcher = useCallback(async (key: string) => {
    // Extraer ID del key
    const id = parseInt(key.replace('job-status-', ''), 10);
    if (!id) return null;
    return await fetcher(id);
  }, [fetcher]);
  
  // Configuración de SWR con polling condicional
  const { data, error, isLoading, mutate } = useSWR<JobStatus | null>(
    swrKey,
    swrFetcher,
    {
      // Solo hacer polling si el job está activo
      refreshInterval: (latestData) => {
        if (!latestData) return pollInterval; // Si no hay datos, hacer poll
        
        // Si está activo, seguir haciendo polling
        if (isJobActive(latestData)) {
          return pollInterval;
        }
        
        // Si está completado o fallido, detener polling
        return 0;
      },
      
      // No revalidar al cambiar de pestaña (evita requests innecesarias)
      revalidateOnFocus: false,
      
      // Revalidar al reconectar (útil si se perdió conexión)
      revalidateOnReconnect: true,
      
      // Retry automático en caso de error
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      
      // Mantener datos anteriores mientras carga nueva data
      keepPreviousData: true,
    }
  );
  
  // Callback cuando los datos cambian
  useEffect(() => {
    if (data && onStatusUpdate) {
      onStatusUpdate(data);
    }
  }, [data, onStatusUpdate]);
  
  // Función para forzar actualización manual
  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);
  
  // Determinar si el job está activo
  const isActive = data ? isJobActive(data) : false;
  
  // Determinar si está completado
  const isCompleted = data ? (
    (data.job_status?.toLowerCase() === "complete" || 
     data.campaign_status?.toLowerCase() === "completed" ||
     data.query_status?.toLowerCase() === "completed")
  ) : false;
  
  // Determinar si falló
  const isFailed = data ? (
    (data.job_status?.toLowerCase() === "failed" ||
     data.campaign_status?.toLowerCase() === "failed" ||
     data.query_status?.toLowerCase() === "failed")
  ) : false;
  
  return {
    status: data,
    isLoading: isLoading && !data, // Solo mostrar loading si no hay datos previos
    error,
    isActive,
    isCompleted,
    isFailed,
    refresh,
  };
}
