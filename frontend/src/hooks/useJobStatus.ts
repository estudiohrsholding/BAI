/**
 * useJobStatus Hook - Polling Inteligente
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

import { useState, useEffect, useCallback, useRef } from 'react';

export interface JobStatus {
  job_status?: "queued" | "in_progress" | "complete" | "failed" | null;
  campaign_status?: string | null;
  query_status?: string | null;
  progress?: number | null;
  [key: string]: any;
}

interface UseJobStatusOptions<T extends JobStatus = JobStatus> {
  /**
   * Función que obtiene el estado del job (ej: getCampaignStatus, getExtractionQueryStatus)
   */
  fetcher: (id: number) => Promise<T>;
  
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
  onStatusUpdate?: (status: T) => void;
  
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
export function useJobStatus<T extends JobStatus = JobStatus>({
  fetcher,
  jobId,
  pollInterval = 5000,
  onStatusUpdate,
  disabled = false,
}: UseJobStatusOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Función para fetch del estado
  const fetchStatus = useCallback(async () => {
    if (disabled || !jobId || !isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const status = await fetcher(jobId);
      
      if (!isMountedRef.current) return;
      
      setData(status);
      
      // Callback cuando los datos cambian
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
      
      // Si el job está completado o fallido, detener polling
      if (!isJobActive(status)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error("Error al obtener estado del job"));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetcher, jobId, onStatusUpdate, disabled]);

  // Fetch inicial
  useEffect(() => {
    isMountedRef.current = true;
    fetchStatus();
    
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStatus]);

  // Polling condicional basado en el estado del job
  useEffect(() => {
    if (disabled || !jobId) return;
    
    // Si el job está activo, iniciar polling
    if (data && isJobActive(data)) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          if (isMountedRef.current) {
            fetchStatus();
          }
        }, pollInterval);
      }
    } else {
      // Si no está activo, detener polling
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [data, pollInterval, fetchStatus, disabled, jobId]);
  
  // Función para forzar actualización manual
  const refresh = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);
  
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
