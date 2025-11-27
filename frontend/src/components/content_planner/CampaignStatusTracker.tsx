"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Sparkles,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCampaignStatus,
  CampaignStatusResponse,
  ApiError,
  ContentCampaignResponse,
} from "@/lib/api-client";
import { CampaignResultViewer } from "./CampaignResultViewer";

interface CampaignStatusTrackerProps {
  campaignId: number;
  campaignMonth: string;
  campaign?: ContentCampaignResponse; // Campaña completa para mostrar resultados
  onStatusUpdate?: (status: CampaignStatusResponse) => void;
  className?: string;
}

/**
 * CampaignStatusTracker Component
 * 
 * Componente dedicado para monitorear el estado de una campaña de contenido mensual.
 * Hace polling cada 5 segundos del endpoint de estado del job de Arq.
 * 
 * Solo visible para usuarios CEREBRO o superior.
 */
export function CampaignStatusTracker({
  campaignId,
  campaignMonth,
  campaign,
  onStatusUpdate,
  className,
}: CampaignStatusTrackerProps) {
  const [jobStatus, setJobStatus] = useState<CampaignStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const fetchJobStatus = async () => {
    try {
      const status = await getCampaignStatus(campaignId);
      setJobStatus(status);
      setError(null);
      
      // Notificar al componente padre si hay callback
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401) {
        setError(err.message || "Error al obtener estado del job");
      }
      // 401 errors are handled automatically by api-client
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar estado inmediatamente
    fetchJobStatus();

    // Polling cada 5 segundos
    const interval = setInterval(fetchJobStatus, 5000);

    return () => clearInterval(interval);
  }, [campaignId]);

  if (isLoading && !jobStatus) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-slate-400", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Cargando estado...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-md border border-red-500/30 bg-red-500/10 p-3", className)}>
        <p className="text-xs font-medium text-red-400">{error}</p>
      </div>
    );
  }

  if (!jobStatus) {
    return null;
  }

  const getStatusIcon = () => {
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
    
    return labels[status] || String(status);
  };

  const getStatusColor = () => {
    const status = jobStatus.job_status || jobStatus.campaign_status;
    
    const colors: Record<string, string> = {
      queued: "text-slate-400 bg-slate-500/20 border-slate-500/30",
      pending: "text-slate-400 bg-slate-500/20 border-slate-500/30",
      in_progress: "text-amber-400 bg-amber-500/20 border-amber-500/30",
      complete: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      completed: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      failed: "text-red-400 bg-red-500/20 border-red-500/30",
    };
    
    return colors[status] || colors.pending;
  };

  const isActive = jobStatus.job_status === "in_progress" || 
                  jobStatus.campaign_status === "in_progress" ||
                  jobStatus.job_status === "queued";

  const isCompleted = jobStatus.job_status === "complete" || 
                     jobStatus.campaign_status === "completed";

  return (
    <>
      <div className={cn("rounded-md border border-violet-500/30 bg-violet-500/5 p-3", className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-xs font-medium text-slate-300">Estado de Generación</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                getStatusColor()
              )}
            >
              {getStatusLabel()}
            </span>
            {isCompleted && campaign && campaign.generated_content && (
              <button
                onClick={() => setIsViewerOpen(true)}
                className="flex items-center gap-1.5 rounded-md border border-violet-500/50 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300 hover:bg-violet-500/20 transition-colors"
              >
                <Eye className="h-3 w-3" />
                Ver Contenido
              </button>
            )}
          </div>
        </div>

      {/* Progress Bar */}
      {isActive && jobStatus.progress !== null && (
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
          <p className="text-xs text-slate-500 mt-1">
            Generando contenido para {campaignMonth}...
          </p>
        </div>
      )}

      {/* Job Info */}
      <div className="space-y-1 text-xs text-slate-500">
        {jobStatus.job_id && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-violet-400" />
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

      {/* Result Viewer Modal */}
      {campaign && (
        <CampaignResultViewer
          campaign={campaign}
          open={isViewerOpen}
          onOpenChange={setIsViewerOpen}
        />
      )}
    </>
  );
}

