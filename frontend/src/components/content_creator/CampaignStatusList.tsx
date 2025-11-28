"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCampaignJobStatus,
  CampaignJobStatusResponse,
} from "@/lib/api-client";
import { useJobStatus } from "@/hooks/useJobStatus";

interface CampaignStatusListProps {
  campaignId: number;
  campaignName: string;
  onStatusUpdate?: (status: CampaignJobStatusResponse) => void;
}

/**
 * CampaignStatusList Component
 * 
 * Componente dedicado para monitorear el estado de una campaña de contenido.
 * Hace polling cada 5 segundos del endpoint de estado del job de Arq.
 * 
 * Solo visible para usuarios PARTNER.
 */
export function CampaignStatusList({
  campaignId,
  campaignName,
  onStatusUpdate,
}: CampaignStatusListProps) {
  // Usar hook de SWR con polling inteligente
  const {
    status: jobStatus,
    isLoading,
    error: swrError,
    isActive,
  } = useJobStatus({
    fetcher: getCampaignJobStatus,
    jobId: campaignId,
    pollInterval: 5000,
    onStatusUpdate,
  });
  
  // Convertir error de SWR a string
  const error = swrError ? (swrError instanceof Error ? swrError.message : "Error al obtener estado del job") : null;

  if (isLoading && !jobStatus) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Cargando estado...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
        <p className="text-xs font-medium text-red-400">{error}</p>
      </div>
    );
  }

  if (!jobStatus) {
    return null;
  }

  const getStatusIcon = () => {
    if (!jobStatus) return <Clock className="h-4 w-4 text-slate-400" />;
    
    if (jobStatus.job_status === "complete" || jobStatus.campaign_status === "completed") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
    if (jobStatus.job_status === "in_progress" || jobStatus.campaign_status === "in_progress") {
      return <Activity className="h-4 w-4 text-amber-400 animate-pulse" />;
    }
    if (jobStatus.job_status === "failed" || jobStatus.campaign_status === "failed") {
      return <XCircle className="h-4 w-4 text-red-400" />;
    }
    return <Clock className="h-4 w-4 text-slate-400" />;
  };

  const getStatusLabel = () => {
    if (!jobStatus) return "Pendiente";
    
    // Priorizar job_status sobre campaign_status para mostrar el estado más actualizado
    const status = jobStatus.job_status || jobStatus.campaign_status;
    
    const labels: Record<string, string> = {
      queued: "En Cola",
      in_progress: "En Progreso",
      complete: "Completado",
      completed: "Completado",
      failed: "Fallido",
      pending: "Pendiente",
    };
    
    return labels[status || ""] || String(status || "Pendiente");
  };

  const getStatusColor = () => {
    if (!jobStatus) return "text-slate-400 bg-slate-500/20 border-slate-500/30";
    
    const status = jobStatus.job_status || jobStatus.campaign_status;
    
    const colors: Record<string, string> = {
      queued: "text-slate-400 bg-slate-500/20 border-slate-500/30",
      pending: "text-slate-400 bg-slate-500/20 border-slate-500/30",
      in_progress: "text-amber-400 bg-amber-500/20 border-amber-500/30",
      complete: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      completed: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      failed: "text-red-400 bg-red-500/20 border-red-500/30",
    };
    
    return colors[status || ""] || colors.pending;
  };

  return (
    <div className="rounded-md border border-slate-700 bg-slate-800/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs font-medium text-slate-300">Estado del Job</span>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-xs font-medium",
            getStatusColor()
          )}
        >
          {getStatusLabel()}
        </span>
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
                  : "bg-gradient-to-r from-amber-500 to-yellow-500"
              )}
              style={{ width: `${jobStatus.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Job Info */}
      <div className="space-y-1 text-xs text-slate-500">
        {jobStatus.job_id && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            <span>Job ID: {jobStatus.job_id.slice(0, 8)}...</span>
          </div>
        )}
        {jobStatus.job_status && (
          <div>
            <span className="text-slate-400">Estado Arq:</span>{" "}
            <span className="text-slate-300">{jobStatus.job_status}</span>
          </div>
        )}
        {jobStatus.error && (
          <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/10 p-2">
            <p className="text-xs font-medium text-red-400">{jobStatus.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

