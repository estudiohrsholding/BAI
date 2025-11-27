"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  DatabaseZap,
  ExternalLink,
  FileJson,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getExtractionQueryStatus,
  getExtractionQueries,
  ExtractionQueryStatusResponse,
  ExtractionQueryResponse,
  ApiError,
} from "@/lib/api-client";
import { ExtractionResultViewer } from "./ExtractionResultViewer";

interface ExtractionStatusListProps {
  onStatusUpdate?: (queryId: number, status: ExtractionQueryStatusResponse) => void;
  className?: string;
}

/**
 * ExtractionStatusList Component
 * 
 * Componente para monitorear el estado de las queries de extracción de datos.
 * Hace polling cada 5-10 segundos del endpoint de estado del job de Arq.
 * 
 * Solo visible para usuarios CEREBRO o superior.
 */
export function ExtractionStatusList({
  onStatusUpdate,
  className,
}: ExtractionStatusListProps) {
  const [queries, setQueries] = useState<ExtractionQueryResponse[]>([]);
  const [statusMap, setStatusMap] = useState<Map<number, ExtractionQueryStatusResponse>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingResults, setViewingResults] = useState<number | null>(null);

  const loadQueries = async () => {
    try {
      const response = await getExtractionQueries(50, 0);
      setQueries(response.queries);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        setError(err.message || "Error al cargar queries");
      }
      // 401 errors are handled automatically by api-client
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQueryStatus = async (queryId: number) => {
    try {
      const status = await getExtractionQueryStatus(queryId);
      setStatusMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(queryId, status);
        return newMap;
      });

      // Notificar al componente padre si hay callback
      if (onStatusUpdate) {
        onStatusUpdate(queryId, status);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        console.error(`Error fetching status for query ${queryId}:`, err);
      }
    }
  };

  // Cargar queries al montar
  useEffect(() => {
    loadQueries();
  }, []);

  // Polling de estados para queries activas
  useEffect(() => {
    if (queries.length === 0) return;

    // Filtrar queries que necesitan polling (pending, in_progress)
    const activeQueries = queries.filter(
      (q) => q.status === "pending" || q.status === "in_progress"
    );

    if (activeQueries.length === 0) return;

    // Cargar estados inmediatamente
    activeQueries.forEach((query) => {
      if (query.arq_job_id) {
        fetchQueryStatus(query.id);
      }
    });

    // Polling cada 5 segundos
    const interval = setInterval(() => {
      activeQueries.forEach((query) => {
        if (query.arq_job_id) {
          fetchQueryStatus(query.id);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [queries]);

  const getStatusIcon = (query: ExtractionQueryResponse, jobStatus?: ExtractionQueryStatusResponse) => {
    // Priorizar job_status sobre query_status para mostrar el estado más actualizado
    const status = (jobStatus?.job_status ?? jobStatus?.query_status) || query.status;
    
    if (status === "completed" || status === "complete") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
    if (status === "in_progress") {
      return <Activity className="h-4 w-4 text-amber-400 animate-pulse" />;
    }
    if (status === "failed") {
      return <XCircle className="h-4 w-4 text-red-400" />;
    }
    return <Clock className="h-4 w-4 text-slate-400" />;
  };

  const getStatusLabel = (query: ExtractionQueryResponse, jobStatus?: ExtractionQueryStatusResponse) => {
    const status = (jobStatus?.job_status ?? jobStatus?.query_status) || query.status;
    
    const labels: Record<string, string> = {
      queued: "En Cola",
      pending: "Pendiente",
      in_progress: "En Progreso",
      complete: "Completado",
      completed: "Completado",
      failed: "Fallido",
      cancelled: "Cancelada",
    };
    
    return labels[status] || String(status);
  };

  const getStatusColor = (query: ExtractionQueryResponse, jobStatus?: ExtractionQueryStatusResponse) => {
    const status = (jobStatus?.job_status ?? jobStatus?.query_status) || query.status;
    
    const colors: Record<string, string> = {
      queued: "text-slate-400 bg-slate-500/20 border-slate-500/30",
      pending: "text-slate-400 bg-slate-500/20 border-slate-500/30",
      in_progress: "text-amber-400 bg-amber-500/20 border-amber-500/30",
      complete: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      completed: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      failed: "text-red-400 bg-red-500/20 border-red-500/30",
      cancelled: "text-slate-500 bg-slate-600/20 border-slate-600/30",
    };
    
    return colors[status] || colors.pending;
  };

  if (isLoading) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Cargando queries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-md border border-red-500/30 bg-red-500/10 p-4", className)}>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <DatabaseZap className="h-12 w-12 text-violet-400/50 mx-auto mb-4" />
        <p className="text-sm text-slate-400">
          No tienes queries de extracción aún. Lanza tu primera query arriba.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {queries.map((query) => {
        const jobStatus = statusMap.get(query.id);
        // Determinar si la query está activa (pendiente o en progreso)
        // El job_status puede ser "queued" | "in_progress" | "complete" | "failed" | null
        // El query.status puede ser "pending" | "in_progress" | "completed" | "failed" | "cancelled"
        const isActive =
          query.status === "pending" ||
          query.status === "in_progress" ||
          jobStatus?.job_status === "queued" ||
          jobStatus?.job_status === "in_progress";

        return (
          <div
            key={query.id}
            className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-900/70 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(query, jobStatus)}
                  <h3 className="text-base font-semibold text-white">{query.search_topic}</h3>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs font-medium",
                      getStatusColor(query, jobStatus)
                    )}
                  >
                    {getStatusLabel(query, jobStatus)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Query ID: {query.id} | Creada: {new Date(query.created_at).toLocaleDateString("es-ES")}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {isActive && jobStatus && jobStatus.progress !== null && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Progreso</span>
                  <span className="text-xs font-medium text-slate-300">
                    {jobStatus.progress}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      jobStatus.progress === 100
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    )}
                    style={{ width: `${jobStatus.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Job Info */}
            {jobStatus?.job_id && (
              <div className="mb-3 space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <DatabaseZap className="h-3 w-3" />
                  <span>Job ID: {jobStatus.job_id.slice(0, 8)}...</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {jobStatus?.error && (
              <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 p-2">
                <p className="text-xs font-medium text-red-400">{jobStatus.error}</p>
              </div>
            )}

            {query.error_message && (
              <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 p-2">
                <p className="text-xs font-medium text-red-400">
                  Error: {query.error_message}
                </p>
              </div>
            )}

            {/* Results Available */}
            {query.status === "completed" && query.results && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FileJson className="h-3 w-3 text-emerald-400" />
                      <p className="text-xs font-medium text-emerald-400">
                        Resultados Disponibles
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {query.results.sources && Array.isArray(query.results.sources)
                        ? `${query.results.sources.length} fuentes encontradas`
                        : "Resultados estructurados disponibles"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setViewingResults(viewingResults === query.id ? null : query.id);
                    }}
                    className="rounded-md border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                  >
                    {viewingResults === query.id ? "Ocultar" : "Ver"} Reporte
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
                {viewingResults === query.id && (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 p-4">
                    <ExtractionResultViewer
                      queryId={query.id}
                      onClose={() => setViewingResults(null)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-800">
              <span>
                Creada: {new Date(query.created_at).toLocaleDateString("es-ES")}
              </span>
              {query.completed_at && (
                <span>
                  Completada: {new Date(query.completed_at).toLocaleDateString("es-ES")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

