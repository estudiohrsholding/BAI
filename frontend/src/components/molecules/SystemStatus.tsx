"use client";

import { useEffect, useState } from "react";
import { getSystemHealth, SystemHealth, ServiceStatus } from "@/lib/api-client";
import { Database, Zap, Bot, Cpu } from "lucide-react";

/**
 * SystemStatus Component
 * 
 * Muestra el estado de salud de todos los servicios del sistema:
 * - Database (PostgreSQL)
 * - Redis (Cache & Queue)
 * - Worker (Arq)
 * - AI Engine (Gemini)
 * 
 * Actualiza automáticamente cada 30 segundos.
 */
export function SystemStatus() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const healthData = await getSystemHealth();
      setHealth(healthData);
    } catch (err) {
      setError("No se pudo conectar al sistema");
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkHealth();

    // Poll every 30 seconds to keep status updated
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  // Determinar estado general
  const overallStatus = health?.status || "unhealthy";
  const isHealthy = overallStatus === "healthy";
  const isDegraded = overallStatus === "degraded";

  return (
    <div className="space-y-3">
      {/* Header con estado general */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isHealthy
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : isDegraded
                ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                : "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            }`}
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400">System Status</span>
            <span
              className={`text-[10px] font-bold uppercase ${
                isHealthy
                  ? "text-emerald-500"
                  : isDegraded
                  ? "text-amber-500"
                  : "text-red-500"
              }`}
            >
              {isLoading
                ? "CHECKING..."
                : isHealthy
                ? "HEALTHY"
                : isDegraded
                ? "DEGRADED"
                : "UNHEALTHY"}
            </span>
          </div>
        </div>
        {health && (
          <span className="text-[10px] text-slate-500 font-mono">
            v{health.version}
          </span>
        )}
      </div>

      {/* Servicios individuales */}
      {health && (
        <div className="grid grid-cols-2 gap-2">
          <ServiceIndicator
            name="Database"
            service={health.services.database}
            icon={Database}
            color="blue"
          />
          <ServiceIndicator
            name="Redis"
            service={health.services.redis}
            icon={Zap}
            color="amber"
          />
          <ServiceIndicator
            name="Worker"
            service={health.services.worker}
            icon={Cpu}
            color="violet"
          />
          <ServiceIndicator
            name="AI Engine"
            service={health.services.ai_engine}
            icon={Bot}
            color="emerald"
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

interface ServiceIndicatorProps {
  name: string;
  service?: ServiceStatus;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "amber" | "violet" | "emerald";
}

function ServiceIndicator({ name, service, icon: Icon, color }: ServiceIndicatorProps) {
  const status = service?.status || "down";
  const isUp = status === "up";
  const isDegraded = status === "degraded";

  const colorClasses = {
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      dot: isUp ? "bg-blue-500" : isDegraded ? "bg-amber-500" : "bg-red-500",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      dot: isUp ? "bg-amber-500" : isDegraded ? "bg-amber-500" : "bg-red-500",
    },
    violet: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      text: "text-violet-400",
      dot: isUp ? "bg-violet-500" : isDegraded ? "bg-amber-500" : "bg-red-500",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      dot: isUp ? "bg-emerald-500" : isDegraded ? "bg-amber-500" : "bg-red-500",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`px-2 py-1.5 rounded-md border ${colors.bg} ${colors.border} transition-all`}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${
              isUp ? "shadow-[0_0_4px_currentColor]" : ""
            }`}
          />
          {isUp && (
            <div
              className={`absolute inset-0 w-1.5 h-1.5 rounded-full ${colors.dot} animate-ping opacity-75`}
            />
          )}
        </div>
        <Icon className={`w-3 h-3 ${colors.text}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-slate-300 truncate">{name}</p>
          {service?.latency_ms !== undefined && (
            <p className="text-[9px] text-slate-500 font-mono">
              {service.latency_ms}ms
            </p>
          )}
        </div>
      </div>
      {service?.error && (
        <p className="text-[9px] text-red-400 mt-1 truncate" title={service.error}>
          {service.error}
        </p>
      )}
    </div>
  );
}
