/**
 * QueryStatusItem - Componente Individual para Query con Polling Inteligente
 * 
 * Componente que usa SWR para monitorear el estado de una query individual.
 * Solo hace polling cuando la query está activa.
 */

"use client";

import { useJobStatus } from "@/hooks/useJobStatus";
import { getExtractionQueryStatus, ExtractionQueryResponse, ExtractionQueryStatusResponse } from "@/lib/api-client";
import { ExtractionResultViewer } from "./ExtractionResultViewer";
import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  DatabaseZap,
  ExternalLink,
  FileJson,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryStatusItemProps {
  query: ExtractionQueryResponse;
  onStatusUpdate?: (queryId: number, status: ExtractionQueryStatusResponse) => void;
}

export function QueryStatusItem({ query, onStatusUpdate }: QueryStatusItemProps) {
  const [viewingResults, setViewingResults] = useState(false);
  
  // Solo hacer polling si la query está activa y tiene job_id
  const needsPolling = (query.status === "pending" || query.status === "in_progress") && !!query.arq_job_id;
  
  // Usar hook de SWR con polling condicional
  const {
    status: jobStatus,
    isLoading: isLoadingStatus,
    error: statusError,
    isActive,
  } = useJobStatus({
    fetcher: getExtractionQueryStatus,
    jobId: query.id,
    pollInterval: 5000,
    onStatusUpdate: (status) => {
      if (onStatusUpdate) {
        onStatusUpdate(query.id, status as ExtractionQueryStatusResponse);
      }
    },
    disabled: !needsPolling, // Solo hacer polling si es necesario
  });
  
  const getStatusIcon = () => {
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
  
  const getStatusLabel = () => {
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
  
  const getStatusColor = () => {
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
  
  const isActiveState = isActive || 
    query.status === "pending" ||
    query.status === "in_progress";
  
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-900/70 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon()}
            <h3 className="text-base font-semibold text-white">{query.search_topic}</h3>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                getStatusColor()
              )}
            >
              {getStatusLabel()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Query ID: {query.id} | Creada: {new Date(query.created_at).toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {isActiveState && jobStatus && jobStatus.progress !== null && (
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
              onClick={() => setViewingResults(!viewingResults)}
              className="rounded-md border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
            >
              {viewingResults ? "Ocultar" : "Ver"} Reporte
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          {viewingResults && (
            <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 p-4">
              <ExtractionResultViewer
                queryId={query.id}
                onClose={() => setViewingResults(false)}
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
}

