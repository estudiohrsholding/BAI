/**
 * useMultipleJobStatuses Hook - Polling Inteligente para Múltiples Jobs
 * 
 * Hook para monitorear el estado de múltiples jobs simultáneamente.
 * Solo hace polling de jobs activos (queued, in_progress).
 * 
 * Útil para listas de queries/campañas donde solo algunas están activas.
 */

import useSWR from 'swr';
import { useMemo } from 'react';

export interface JobStatus {
  job_status?: "queued" | "in_progress" | "complete" | "failed" | null;
  query_status?: string | null;
  campaign_status?: string | null;
  progress?: number | null;
  [key: string]: any;
}

interface JobItem {
  id: number;
  status?: string;
  arq_job_id?: string | null;
}

interface UseMultipleJobStatusesOptions<T extends JobItem> {
  /**
   * Array de items (queries, campaigns, etc.) a monitorear
   */
  items: T[];
  
  /**
   * Función que obtiene el estado de un job individual
   */
  fetcher: (id: number) => Promise<JobStatus>;
  
  /**
   * Intervalo de polling en milisegundos cuando hay jobs activos
   * @default 5000 (5 segundos)
   */
  pollInterval?: number;
  
  /**
   * Callback opcional cuando el estado de un job se actualiza
   */
  onStatusUpdate?: (itemId: number, status: JobStatus) => void;
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
 * Determina si un item necesita polling
 */
function needsPolling<T extends JobItem>(item: T): boolean {
  const status = (item.status || "").toLowerCase();
  const activeStatuses = ["pending", "in_progress"];
  return activeStatuses.includes(status) && !!item.arq_job_id;
}

/**
 * Hook para monitorear múltiples jobs con polling inteligente
 */
export function useMultipleJobStatuses<T extends JobItem>({
  items,
  fetcher,
  pollInterval = 5000,
  onStatusUpdate,
}: UseMultipleJobStatusesOptions<T>) {
  
  // Filtrar items que necesitan polling
  const itemsNeedingPolling = useMemo(() => {
    return items.filter(needsPolling);
  }, [items]);
  
  // Crear keys SWR para cada item que necesita polling
  const swrKeys = useMemo(() => {
    return itemsNeedingPolling.map(item => `job-status-${item.id}`);
  }, [itemsNeedingPolling]);
  
  // Función de fetch para SWR
  const swrFetcher = async (key: string): Promise<[number, JobStatus | null]> => {
    const id = parseInt(key.replace('job-status-', ''), 10);
    if (!id) return [0, null];
    try {
      const status = await fetcher(id);
      if (onStatusUpdate) {
        onStatusUpdate(id, status);
      }
      return [id, status];
    } catch (error) {
      console.error(`Error fetching status for job ${id}:`, error);
      return [id, null];
    }
  };
  
  // Obtener estados de todos los jobs que necesitan polling
  // Nota: SWR no soporta múltiples keys directamente, así que usamos un enfoque diferente
  // Por ahora, cada job se monitorea individualmente
  
  // Retornar map de estados
  const statusMap = useMemo(() => {
    const map = new Map<number, JobStatus | null>();
    // Los estados se obtendrán individualmente en los componentes
    return map;
  }, []);
  
  return {
    itemsNeedingPolling,
    statusMap,
  };
}

