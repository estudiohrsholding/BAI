"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Lock,
  Unlock,
  TrendingUp,
  Search,
  Globe,
  Twitter,
  CheckCircle2,
  Star,
  ArrowRight,
  FileJson,
  Terminal,
  Activity,
  Users,
  DatabaseZap,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { ProcessingTerminal } from "@/components/modules/data-mining/ProcessingTerminal";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";

// ============================================
// ESTRUCTURA DE DATOS DINÁMICA
// ============================================

interface DashboardData {
  topic: string;
  kpis: {
    viability: number;
    viral: number;
  };
  trends: Array<{ name: string; value: number }>;
  sentiment: Array<{ name: string; value: number; color: string }>;
  demographics: Array<{ name: string; value: number }>;
  social: Array<{ name: string; value: number; color?: string; fill?: string }>;
  devices: Array<{ name: string; value: number; color: string }>;
  geo: Array<{ name: string; value: number; color: string }>;
  radar: Array<{ category: string; A: number; B?: number }>;
  multiLine: Array<{ month: string; Instagram: number; TikTok: number; YouTube: number }>;
  hourly: Array<{ hour: string; value: number }>;
}

// Datos por defecto (Fallback)
const INITIAL_DATA: DashboardData = {
  topic: "Análisis General",
  kpis: {
    viability: 0,
    viral: 0,
  },
  trends: [
    { name: "Ene", value: 0 },
    { name: "Feb", value: 0 },
    { name: "Mar", value: 0 },
    { name: "Abr", value: 0 },
    { name: "May", value: 0 },
    { name: "Jun", value: 0 },
  ],
  sentiment: [
    { name: "Positivo", value: 33, color: "#10b981" },
    { name: "Neutral", value: 33, color: "#8b5cf6" },
    { name: "Negativo", value: 33, color: "#f59e0b" },
  ],
  demographics: [
    { name: "18-24", value: 25 },
    { name: "25-34", value: 25 },
    { name: "35-44", value: 25 },
    { name: "45+", value: 25 },
  ],
  social: [
    { name: "Instagram", value: 25, color: "#E4405F" },
    { name: "Twitter", value: 25, color: "#1DA1F2" },
    { name: "TikTok", value: 25, color: "#000000" },
    { name: "LinkedIn", value: 25, color: "#0077b5" },
  ],
  devices: [
    { name: "Mobile", value: 50, color: "#8b5cf6" },
    { name: "Desktop", value: 50, color: "#6366f1" },
  ],
  geo: [{ name: "España", value: 100, color: "#10b981" }],
  radar: [
    { category: "Innovación", A: 50 },
    { category: "Precio", A: 50 },
    { category: "Calidad", A: 50 },
    { category: "Alcance", A: 50 },
    { category: "Fidelidad", A: 50 },
    { category: "Viralidad", A: 50 },
  ],
  multiLine: [
    { month: "Ene", Instagram: 25, TikTok: 25, YouTube: 25 },
    { month: "Feb", Instagram: 25, TikTok: 25, YouTube: 25 },
    { month: "Mar", Instagram: 25, TikTok: 25, YouTube: 25 },
    { month: "Abr", Instagram: 25, TikTok: 25, YouTube: 25 },
    { month: "May", Instagram: 25, TikTok: 25, YouTube: 25 },
    { month: "Jun", Instagram: 25, TikTok: 25, YouTube: 25 },
  ],
  hourly: [
    { hour: "00", value: 10 },
    { hour: "06", value: 15 },
    { hour: "12", value: 50 },
    { hour: "18", value: 70 },
    { hour: "21", value: 60 },
  ],
};

// ============================================
// FUNCIÓN: CONVERTIR RESPUESTA DEL BACKEND A DASHBOARD DATA
// ============================================

function convertBackendReportToDashboardData(backendReport: any): DashboardData {
  return {
    topic: backendReport.topic || "Análisis General",
    kpis: {
      viability: backendReport.kpis?.viability || 0,
      viral: backendReport.kpis?.viral || 0,
    },
    trends: (backendReport.trends || []).map((t: any) => ({
      name: t.name,
      value: t.value || 0,
    })),
    sentiment: (backendReport.sentiment || []).map((s: any) => ({
      name: s.name,
      value: s.value || 0,
      color: s.color || "#8b5cf6",
    })),
    demographics: (backendReport.demographics || []).map((d: any) => ({
      name: d.name,
      value: d.value || 0,
    })),
    social: (backendReport.social || []).map((s: any) => ({
      name: s.name,
      value: s.value || 0,
      color: s.color || s.fill || "#6366f1",
      fill: s.fill || s.color || "#6366f1",
    })),
    devices: (backendReport.devices || []).map((d: any) => ({
      name: d.name,
      value: d.value || 0,
      color: d.color || "#8b5cf6",
    })),
    geo: (backendReport.geo || []).map((g: any) => ({
      name: g.name,
      value: g.value || 0,
      color: g.color || "#10b981",
    })),
    radar: (backendReport.radar || []).map((r: any) => ({
      category: r.subject || r.category,
      A: r.A || 50,
      B: r.B,
    })),
    multiLine: (backendReport.multiLine || []).map((m: any) => ({
      month: m.month,
      Instagram: m.Instagram || 0,
      TikTok: m.TikTok || 0,
      YouTube: m.YouTube || 0,
    })),
    hourly: (backendReport.hourly || []).map((h: any) => ({
      hour: h.hour,
      value: h.value || 0,
    })),
  };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function DataMiningPage() {
  const [status, setStatus] = useState<"locked" | "processing" | "unlocked">("locked");
  const [data, setData] = useState<DashboardData>(INITIAL_DATA);
  const [hasRecentChat, setHasRecentChat] = useState(false);
  const { openChat, isOpen: isChatOpen } = useChat();

  // Verificar si hay historial de chat reciente
  useEffect(() => {
    const checkChatHistory = async () => {
      try {
        // Usar cliente API centralizado (inyección automática de token)
        const history = await apiGet<Array<{ timestamp?: string }>>("/api/chat/history");
        
        if (Array.isArray(history) && history.length > 0) {
          // Verificar si hay mensajes recientes (últimas 2 horas)
          const recentMessages = history.filter((msg) => {
            if (!msg.timestamp) return false;
            const msgTime = new Date(msg.timestamp).getTime();
            const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
            return msgTime > twoHoursAgo;
          });

          setHasRecentChat(recentMessages.length > 0);
        }
      } catch (error) {
        // Si es error 401, el cliente API ya redirige automáticamente a /login
        if (error instanceof ApiError && error.status !== 401) {
          console.error("Error checking chat history:", error);
        }
        // Silenciar errores 401 (ya se maneja la redirección)
      }
    };

    checkChatHistory();
    // Verificar cada 30 segundos
    const interval = setInterval(checkChatHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateReportFromBackend = async () => {
    try {
      // Usar cliente API centralizado (inyección automática de token y headers)
      const backendReport = await apiPost<{
        topic?: string;
        kpis?: { viability?: number; viral?: number };
        trends?: Array<{ name: string; value: number }>;
        sentiment?: Array<{ name: string; value: number; color: string }>;
        demographics?: Array<{ name: string; value: number }>;
        social?: Array<{ name: string; value: number; color?: string; fill?: string }>;
        devices?: Array<{ name: string; value: number; color: string }>;
        geo?: Array<{ name: string; value: number; color: string }>;
        radar?: Array<{ subject?: string; category?: string; A?: number; B?: number }>;
        multiLine?: Array<{ month: string; Instagram?: number; TikTok?: number; YouTube?: number }>;
        hourly?: Array<{ hour: string; value: number }>;
      }>("/api/data/mining-report", { topic: null }); // El backend extraerá del historial

      const dashboardData = convertBackendReportToDashboardData(backendReport);
      setData(dashboardData);
    } catch (error) {
      // Si es error 401, el cliente API ya redirige automáticamente a /login
      if (error instanceof ApiError && error.status !== 401) {
        console.error("Error generando reporte:", error);
      }
      // Mantener datos iniciales en caso de error
    }
  };

  const onTerminalComplete = async () => {
    // Generar reporte desde el backend
    try {
      await generateReportFromBackend();
      setStatus("unlocked");
    } catch (error) {
      console.error("Error generando reporte:", error);
      // En caso de error, mostrar dashboard con datos por defecto
      setStatus("unlocked");
    }
  };

  const resetToLocked = () => {
    setStatus("locked");
    setData(INITIAL_DATA);
  };

  const handleStartAnalysis = () => {
    // Abrir el chat real de B.A.I. con mensaje inicial
    openChat(
      "Hola. Soy B.A.I., tu Agente de Minería de Datos. Para generar tu informe de mercado, necesito entender tu proyecto. ¿Cuál es tu idea de negocio o producto? Puedes contarme sobre el sector, tu público objetivo y las plataformas donde quieres estar presente."
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Dashboard siempre renderizado de fondo */}
      <div
        className={cn(
          "transition-all duration-1000",
          status !== "unlocked"
            ? "blur-xl opacity-30 scale-95 pointer-events-none h-screen overflow-hidden"
            : "blur-0 opacity-100 scale-100"
        )}
      >
        <DashboardGrid data={data} onNewAnalysis={resetToLocked} />
      </div>

      {/* CAPA 1: LOCK SCREEN */}
      {status === "locked" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="text-center space-y-6 p-8 max-w-lg animate-in fade-in zoom-in duration-500">
            <div className="mx-auto w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700 shadow-2xl">
              <Lock className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard Protegido</h1>
              <p className="text-slate-400 text-lg">
                {hasRecentChat
                  ? "Tienes una conversación reciente con B.A.I. Puedes generar el reporte ahora o iniciar una nueva conversación."
                  : "Inicia una conversación con B.A.I. para generar tu informe de mercado personalizado. El agente te hará preguntas y luego extraerá datos reales usando Brave Search API."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasRecentChat && (
                <button
                  onClick={async () => {
                    setStatus("processing");
                    await generateReportFromBackend();
                  }}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 flex items-center gap-3"
                >
                  <DatabaseZap className="w-6 h-6" />
                  Generar Reporte Ahora
                </button>
              )}
              <button
                onClick={handleStartAnalysis}
                className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all hover:scale-105 flex items-center gap-3"
              >
                <Bot className="w-6 h-6" />
                {hasRecentChat ? "Nueva Conversación" : "Iniciar Investigación con IA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAPA 2: TERMINAL (Procesando reporte) */}
      {status === "processing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
          <div className="w-full max-w-4xl p-4">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Rastreo Satelital en Progreso...
            </h2>
            <div className="bg-black border-2 border-green-500 rounded-lg p-6 font-mono">
              <ProcessingTerminal onComplete={onTerminalComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE: DASHBOARD GRID
// ============================================

function DashboardGrid({
  data,
  onNewAnalysis,
}: {
  data: DashboardData;
  onNewAnalysis: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <DatabaseZap className="w-6 h-6 text-violet-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Reporte Estratégico</h1>
          </div>
          <p className="text-slate-400">
            Análisis generado en tiempo real: {data.topic} | ID #8823-XJ
          </p>
        </div>
        <button
          onClick={onNewAnalysis}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Bot className="w-4 h-4" />
          Nuevo Análisis
        </button>
      </div>

      {/* Grid de 3 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* KPI 1: Viabilidad */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Viabilidad</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">{data.kpis.viability}</span>
            <span className="text-xl text-slate-500">/100</span>
          </div>
          <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000"
              style={{ width: `${data.kpis.viability}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Viralidad */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Viralidad</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">{data.kpis.viral}</span>
            <span className="text-xl text-slate-500">/10</span>
          </div>
          <div className="flex gap-1 mt-4">
            {Array.from({ length: 10 }, (_, i) => {
              const filled = Math.round(data.kpis.viral);
              return (
                <div
                  key={i}
                  className={cn(
                    "h-2 w-full rounded-full transition-all duration-500",
                    i < filled ? "bg-amber-500" : "bg-slate-800"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* KPI 3: GANCHO ENTERPRISE */}
        <div className="bg-gradient-to-br from-violet-900/50 to-slate-900 border-2 border-violet-500/50 p-6 rounded-xl relative group cursor-pointer hover:border-violet-500 transition-all shadow-xl shadow-violet-900/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Lock className="w-24 h-24 text-violet-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-violet-300 mb-3">
              <Unlock className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Enterprise</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4 leading-tight">
              ¿Objetivo <span className="text-emerald-400">100/100</span>?
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Desbloquea análisis avanzados y estrategias personalizadas
            </p>
            <Link
              href="/plans"
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2"
            >
              Desbloquear Plan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid de 2 Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Tendencia de Interés</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Sentimiento Social</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sentiment}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.sentiment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Nivel 2: Radiografía de Audiencia */}
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-violet-400" />
        Deep Social Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Twitter className="w-4 h-4 text-sky-400" />
            Redes Más Usadas
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.social}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.social.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || entry.fill || "#6366f1"} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            Dispositivos
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.devices}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-3xl font-bold text-white">
                  {data.devices.find((d) => d.name === "Mobile")?.value || 0}%
                </span>
                <p className="text-xs text-slate-500 mt-1">Mobile</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Actividad por Horas
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#64748b"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-slate-900 border-2 border-violet-500/30 p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <DatabaseZap className="w-4 h-4 text-violet-400" />
            Radar de Intereses
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.radar}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis
                  dataKey="category"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} hide />
                <Radar
                  name="Tu Proyecto"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Distribución Geográfica
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.geo} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={60}
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#1e293b" }}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.geo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-pink-400" />
            Tendencias por Plataforma
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.multiLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="line"
                  wrapperStyle={{ fontSize: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey="Instagram"
                  stroke="#E4405F"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="TikTok"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="YouTube"
                  stroke="#FF0000"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Nivel 3: Datos Técnicos */}
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Terminal className="w-6 h-6 text-emerald-400" />
        System Logs & Raw Data
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" /> Demografía
            </h3>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Live</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.demographics} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={40}
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#1e293b" }}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col">
          <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-400" /> Live Search Feed
          </h3>
          <div className="flex-1 bg-black/40 rounded-lg p-4 font-mono text-xs space-y-3 overflow-y-auto border border-slate-800/50 max-h-[250px]">
            <div className="flex gap-2">
              <span className="text-green-500">[INFO]</span>
              <span className="text-slate-400">
                Query: "{data.topic}" | Results: 12 | 14:35:22
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-500">[INFO]</span>
              <span className="text-slate-400">Source: Brave Search API | Status: Connected</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-500">[PENDING]</span>
              <span className="text-slate-500">Processing sentiment analysis...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-500">[WARN]</span>
              <span className="text-slate-400">Saturation detected in region: EU</span>
            </div>
            <div className="flex gap-2">
              <span className="text-green-500">[INFO]</span>
              <span className="text-slate-400">Brave Search API: 47 queries today</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <FileJson className="w-4 h-4 text-amber-400" /> Latest Reports
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50 flex justify-between items-center hover:bg-slate-800 transition-colors cursor-pointer">
              <div>
                <div className="text-xs font-mono text-emerald-400 mb-1">market_analysis_2024.json</div>
                <div className="text-[10px] text-slate-500">Size: 2.4MB | Sources: 47</div>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">
                COMPLETE
              </span>
            </div>
            <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50 flex justify-between items-center opacity-70">
              <div>
                <div className="text-xs font-mono text-amber-400 mb-1">competitor_intel_q1.json</div>
                <div className="text-[10px] text-slate-500">Processing... | Sources: 23</div>
              </div>
              <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
            </div>
          </div>
        </div>
      </div>

      {/* Fuentes Verificadas */}
      <div className="mt-8 border-t border-slate-800 pt-6 flex flex-wrap gap-4 opacity-50 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <Twitter className="w-3 h-3 text-sky-500" />
          <span className="text-xs text-slate-400">Twitter API</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-3 h-3 text-blue-500" />
          <span className="text-xs text-slate-400">Google Trends</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-3 h-3 text-violet-500" />
          <span className="text-xs text-slate-400">Brave Search</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        </div>
        <div className="flex items-center gap-2">
          <DatabaseZap className="w-3 h-3 text-emerald-500" />
          <span className="text-xs text-slate-400">Social Media APIs</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        </div>
      </div>
    </div>
  );
}
