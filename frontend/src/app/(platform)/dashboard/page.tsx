"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  AppWindow,
  DatabaseZap,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet, ApiError, getSystemHealth, SystemHealth } from "@/lib/api-client";

interface DashboardMetrics {
  total_conversions: number;
  conversions_this_month: number;
  worker_status: string;
  worker_queue_size: number;
  usage_stats: Array<{
    feature_key: string;
    count: number;
    period: string;
    limit: number | null;
  }>;
  current_plan: string;
  plan_limits: {
    max_chats: number;
    access_mining: number;
    access_marketing: number;
  };
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch metrics and health in parallel
        const [metricsData, healthData] = await Promise.all([
          apiGet<DashboardMetrics>("/api/v1/analytics/dashboard-metrics"),
          getSystemHealth(),
        ]);

        setMetrics(metricsData);
        setSystemHealth(healthData);
      } catch (err) {
        if (err instanceof ApiError && err.status !== 401) {
          setError(err.message || "Error al cargar métricas");
        }
        // 401 errors are handled automatically by api-client
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPlanDisplayName = (plan: string) => {
    const planMap: Record<string, string> = {
      MOTOR: "Motor",
      CEREBRO: "Cerebro",
      PARTNER: "Partner",
    };
    return planMap[plan] || plan;
  };

  const getPlanColor = (plan: string) => {
    const colorMap: Record<string, string> = {
      MOTOR: "emerald",
      CEREBRO: "violet",
      PARTNER: "amber",
    };
    return colorMap[plan] || "slate";
  };

  const getWorkerStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      healthy: "emerald",
      degraded: "amber",
      down: "red",
    };
    return colorMap[status] || "slate";
  };

  const getFeatureDisplayName = (key: string) => {
    const nameMap: Record<string, string> = {
      ai_content_generation: "Generación de Contenido IA",
      access_mining: "Data Mining",
      access_marketing: "Marketing IA",
    };
    return nameMap[key] || key;
  };

  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto" />
          <p className="text-slate-400">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  const currentPlan = metrics?.current_plan || "MOTOR";
  const planColor = getPlanColor(currentPlan);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hola, Socio</h1>
          <p className="text-slate-400 capitalize">{currentDate}</p>
        </div>
        <div
          className={cn(
            "px-4 py-1 rounded-full text-sm font-medium border flex items-center gap-2",
            planColor === "emerald" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            planColor === "violet" && "bg-violet-500/10 text-violet-400 border-violet-500/20",
            planColor === "amber" && "bg-amber-500/10 text-amber-400 border-amber-500/20"
          )}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                planColor === "emerald" && "bg-emerald-400",
                planColor === "violet" && "bg-violet-400",
                planColor === "amber" && "bg-amber-400"
              )}
            ></span>
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                planColor === "emerald" && "bg-emerald-500",
                planColor === "violet" && "bg-violet-500",
                planColor === "amber" && "bg-amber-500"
              )}
            ></span>
          </span>
          Plan {getPlanDisplayName(currentPlan)}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Conversions */}
        <MetricCard
          title="Conversiones Totales"
          value={metrics?.total_conversions || 0}
          subtitle={`${metrics?.conversions_this_month || 0} este mes`}
          icon={TrendingUp}
          color="emerald"
        />

        {/* Worker Status */}
        <MetricCard
          title="Estado del Worker"
          value={
            metrics?.worker_status === "healthy"
              ? "Operativo"
              : metrics?.worker_status === "degraded"
              ? "Degradado"
              : "Inactivo"
          }
          subtitle={`Cola: ${metrics?.worker_queue_size || 0} jobs`}
          icon={Activity}
          color={getWorkerStatusColor(metrics?.worker_status || "down")}
        />

        {/* AI Content Usage */}
        {metrics?.usage_stats.find((s) => s.feature_key === "ai_content_generation") && (
          <UsageCard
            feature={metrics.usage_stats.find((s) => s.feature_key === "ai_content_generation")!}
            planLimit={metrics.plan_limits.max_chats}
          />
        )}

        {/* System Health */}
        {systemHealth && (
          <MetricCard
            title="Estado del Sistema"
            value={
              systemHealth.status === "healthy"
                ? "Saludable"
                : systemHealth.status === "degraded"
                ? "Degradado"
                : "Crítico"
            }
            subtitle={`${Object.values(systemHealth.services).filter((s) => s.status === "up").length}/${Object.keys(systemHealth.services).length} servicios activos`}
            icon={CheckCircle2}
            color={systemHealth.status === "healthy" ? "emerald" : systemHealth.status === "degraded" ? "amber" : "red"}
          />
        )}
      </div>

      {/* Usage Quotas Section */}
      {metrics && metrics.usage_stats.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-800">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-400" />
            Uso de Features Premium
          </h2>
          <div className="space-y-4">
            {metrics.usage_stats.map((stat) => (
              <UsageBar
                key={stat.feature_key}
                label={getFeatureDisplayName(stat.feature_key)}
                count={stat.count}
                limit={stat.limit}
                period={stat.period}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid de Servicios (LAS 3 RAMAS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 1. Automatización */}
        <ServiceCard
          title="Automatización"
          desc="Tus agentes IA trabajando 24/7."
          icon={Bot}
          href="/automation"
          color="blue"
          action="Gestionar Flujos"
        />

        {/* 2. Ecosistema */}
        <ServiceCard
          title="Ecosistema"
          desc="Galería de Apps verticales."
          icon={AppWindow}
          href="/ecosistema"
          color="violet"
          action="Explorar Catálogo"
          highlight
        />

        {/* 3. Data Mining */}
        <ServiceCard
          title="Data Mining"
          desc="Inteligencia de mercado real."
          icon={DatabaseZap}
          href="/data-mining"
          color="amber"
          action="Generar Informe"
        />
      </div>

      {/* Estado del Plan */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-indigo-300 font-semibold mb-1 uppercase tracking-wider text-xs">
              Tu Plan Actual
            </div>
            <h2 className="text-3xl font-bold mb-2">{getPlanDisplayName(currentPlan)}</h2>
            <p className="text-slate-400 max-w-md text-sm">
              {currentPlan === "MOTOR" &&
                "Tienes acceso a automatizaciones básicas y el Software Studio. Actualiza a CEREBRO para desbloquear IA creativa y Data Mining."}
              {currentPlan === "CEREBRO" &&
                "Tienes acceso completo a IA creativa, Data Mining y workers asíncronos. Actualiza a PARTNER para squads embebidos y CSM dedicado."}
              {currentPlan === "PARTNER" &&
                "Tienes acceso completo a todas las capacidades, incluyendo squads embebidos y CSM dedicado."}
            </p>
          </div>

          {currentPlan !== "PARTNER" && (
            <Link
              href="/#pricing"
              className="px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors shadow-lg shadow-white/10 flex items-center gap-2 whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4" />
              {currentPlan === "MOTOR" ? "Mejorar a Cerebro" : "Mejorar a Partner"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "violet" | "amber" | "red" | "blue";
}

function MetricCard({ title, value, subtitle, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 border", colorClasses[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

interface UsageCardProps {
  feature: {
    feature_key: string;
    count: number;
    period: string;
    limit: number | null;
  };
  planLimit: number;
}

function UsageCard({ feature, planLimit }: UsageCardProps) {
  const percentage = planLimit > 0 ? Math.min((feature.count / planLimit) * 100, 100) : 0;
  const isNearLimit = percentage >= 80;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border bg-violet-500/10 text-violet-400 border-violet-500/20">
        <Zap className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-400 mb-1">Generación IA</h3>
      <p className="text-2xl font-bold text-white mb-2">
        {feature.count} / {planLimit > 0 ? planLimit : "∞"}
      </p>
      <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all",
            isNearLimit ? "bg-amber-500" : "bg-violet-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">Este mes</p>
    </div>
  );
}

interface UsageBarProps {
  label: string;
  count: number;
  limit: number | null;
  period: string;
}

function UsageBar({ label, count, limit, period }: UsageBarProps) {
  const percentage = limit && limit > 0 ? Math.min((count / limit) * 100, 100) : 0;
  const isNearLimit = limit && limit > 0 && percentage >= 80;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm text-slate-400">
          {count} / {limit ? limit : "∞"}
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all",
            isNearLimit ? "bg-amber-500" : "bg-violet-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ServiceCardProps {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: "blue" | "violet" | "amber";
  action: string;
  highlight?: boolean;
}

function ServiceCard({ title, desc, icon: Icon, href, color, action, highlight }: ServiceCardProps) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900",
    violet: "bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-900",
    amber: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900",
  };

  return (
    <div
      className={cn(
        "group p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900",
        highlight
          ? "border-violet-500 shadow-lg shadow-violet-500/10"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{desc}</p>
      <Link
        href={href}
        className="inline-flex items-center text-sm font-semibold text-slate-900 dark:text-white group-hover:underline decoration-slate-300 underline-offset-4"
      >
        {action}
        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
