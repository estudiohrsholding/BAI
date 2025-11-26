"use client";

import { useState, useEffect } from "react";
import {
  BrainCircuit,
  Zap,
  Globe,
  MessageSquare,
  Facebook,
  Send,
  Lock,
  CheckCircle2,
  Search,
  Network,
  FileText,
  Sparkles,
  Activity,
  TrendingUp,
  Crown,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChannelStatus = "active" | "locked";

interface Channel {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: ChannelStatus;
  plan: "basic" | "premium" | "enterprise";
  isPremium?: boolean;
}

// Componente Switch personalizado
function Switch({
  checked,
  onCheckedChange,
  disabled = false,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900",
        checked ? "bg-amber-500" : "bg-slate-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export function NeuralCoreOwnerDashboard() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: "web",
      name: "Web",
      icon: Globe,
      status: "active",
      plan: "basic",
      isPremium: false,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: MessageSquare,
      status: "active",
      plan: "basic",
      isPremium: false,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      status: "active",
      plan: "basic",
      isPremium: false,
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: Send,
      status: "locked",
      plan: "premium",
      isPremium: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: Activity,
      status: "locked",
      plan: "premium",
      isPremium: true,
    },
  ]);

  const [researchLogs, setResearchLogs] = useState<string[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  const researchMessages = [
    "Analizando consulta compleja...",
    "Buscando en fuentes académicas...",
    "Cruzando datos con bases de conocimiento...",
    "Generando respuesta estratégica...",
    "Validando información con múltiples fuentes...",
    "Sintetizando insights empresariales...",
  ];

  // Simular logs en bucle
  useEffect(() => {
    const interval = setInterval(() => {
      setResearchLogs((prev) => {
        const newLog = researchMessages[currentLogIndex];
        const updated = [...prev, newLog];
        // Mantener solo los últimos 5 logs
        if (updated.length > 5) {
          updated.shift();
        }
        return updated;
      });
      setCurrentLogIndex((prev) => (prev + 1) % researchMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentLogIndex]);

  const toggleChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? { ...ch, status: ch.status === "active" ? "locked" : "active" }
          : ch
      )
    );
  };

  const activeChannels = channels.filter((ch) => ch.status === "active").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 text-slate-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 relative">
            <BrainCircuit className="h-6 w-6 text-amber-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Centro de Control Neuronal</h1>
            <p className="text-sm text-amber-400/80">B.A.I. Neural Core - Inteligencia Omnicanal</p>
          </div>
          {/* KPI Principal */}
          <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/50 rounded-xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <div className="text-xs text-amber-400/80 uppercase tracking-wider font-medium mb-2">
              Conocimiento del Negocio
            </div>
            <div className="text-5xl font-bold text-amber-400">98%</div>
            <div className="flex items-center gap-1 text-xs text-amber-400/60 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+2% esta semana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout de 3 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: Conectividad */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 shadow-lg shadow-amber-500/10 h-full">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Conectividad</h2>
            </div>

            <div className="space-y-4">
              {channels.map((channel) => {
                const ChannelIcon = channel.icon;
                const isActive = channel.status === "active";
                const isLocked = channel.plan === "premium" && !isActive;

                return (
                  <div
                    key={channel.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                      isActive
                        ? "bg-amber-500/10 border-amber-500/40"
                        : "bg-slate-800/50 border-slate-700/50"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          isActive ? "bg-amber-500/20" : "bg-slate-700/50"
                        )}
                      >
                        <ChannelIcon
                          className={cn(
                            "h-5 w-5",
                            isActive ? "text-amber-400" : "text-slate-500"
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{channel.name}</span>
                          {channel.isPremium && (
                            <Crown className="h-3 w-3 text-amber-400" />
                          )}
                        </div>
                        {isLocked && (
                          <div className="text-xs text-slate-500 mt-0.5">Requiere Premium</div>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => toggleChannel(channel.id)}
                      disabled={channel.plan === "premium" && !isActive}
                    />
                  </div>
                );
              })}
            </div>

            {/* Resumen */}
            <div className="mt-6 pt-6 border-t border-amber-500/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Canales Activos</span>
                <span className="text-amber-400 font-bold">{activeChannels}/{channels.length}</span>
              </div>
            </div>

            {/* Live Deployment - Caso de Éxito */}
            <div className="mt-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-400 tracking-wider">LIVE DEPLOYMENT</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">Inmobiliaria Los Altos</h3>
              <p className="text-slate-400 text-xs mb-4">
                Agente de Ventas Inmobiliario totalmente autónomo integrado en web externa. Capta leads, agenda visitas y consulta inventario en tiempo real.
              </p>

              <a
                href="/test-inmo.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <span>Visitar Web del Cliente</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* COLUMNA CENTRO: Deep Research Logs */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 shadow-lg shadow-amber-500/10 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Search className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Deep Research Logs</h2>
              <span className="ml-auto text-xs text-amber-400/60 bg-amber-500/10 px-2 py-1 rounded">
                En tiempo real
              </span>
            </div>

            {/* Terminal */}
            <div className="flex-1 bg-black/60 rounded-lg p-4 font-mono text-xs space-y-2 overflow-y-auto border border-amber-500/20 min-h-[400px]">
              {researchLogs.length === 0 ? (
                <div className="flex items-center gap-2 text-amber-500/50 text-sm animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Inicializando sistema de investigación...</span>
                </div>
              ) : (
                researchLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-amber-400/90 animate-in slide-in-from-left-2 fade-in duration-300"
                  >
                    <span className="text-amber-500/60">{`[${new Date().toLocaleTimeString()}]`}</span>
                    <span className="text-green-400">[INFO]</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
              {/* Cursor parpadeante */}
              <div className="flex items-center gap-2 text-amber-400">
                <span className="animate-pulse">▊</span>
                <span className="text-amber-500/50">Listo para nueva consulta...</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Inteligencia Enterprise */}
        <div className="lg:col-span-4">
          <div className="space-y-6">
            {/* Modelo de Lenguaje Empresarial */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-2 mb-6">
                <Network className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Modelo de Lenguaje Empresarial</h2>
              </div>

              {/* Visualización de Red Neuronal */}
              <div className="relative h-48 bg-gradient-to-br from-amber-950/30 to-slate-950 rounded-lg border border-amber-500/20 flex items-center justify-center mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    {/* Nodo central */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-amber-500/30 rounded-full border-2 border-amber-400 flex items-center justify-center animate-pulse">
                      <BrainCircuit className="h-7 w-7 text-amber-400" />
                    </div>
                    {/* Nodos periféricos y conexiones */}
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const angle = (i * 60 * Math.PI) / 180;
                      const x = Math.cos(angle) * 70;
                      const y = Math.sin(angle) * 70;
                      return (
                        <div key={i} className="absolute top-1/2 left-1/2">
                          {/* Línea de conexión */}
                          <svg
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                            width="100%"
                            height="100%"
                            style={{ width: "140px", height: "140px" }}
                          >
                            <line
                              x1="50%"
                              y1="50%"
                              x2={`${50 + (x / 1.4)}%`}
                              y2={`${50 + (y / 1.4)}%`}
                              stroke="rgba(245, 158, 11, 0.4)"
                              strokeWidth="1.5"
                              className="animate-pulse"
                              style={{
                                animationDelay: `${i * 0.2}s`,
                              }}
                            />
                          </svg>
                          {/* Nodo */}
                          <div
                            className="absolute w-7 h-7 bg-amber-500/20 rounded-full border border-amber-400/50 flex items-center justify-center"
                            style={{
                              top: `calc(50% + ${y}px - 14px)`,
                              left: `calc(50% + ${x}px - 14px)`,
                            }}
                          >
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-center z-10 bg-slate-950/80 px-3 py-1 rounded-lg border border-amber-500/30">
                  <div className="text-amber-400 text-xs font-medium">Red Neuronal Activa</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">7 capas • 12,847 parámetros</div>
                </div>
              </div>

              {/* Estadísticas del Modelo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="text-xs text-slate-400 mb-1">Precisión</div>
                  <div className="text-lg font-bold text-amber-400">94.2%</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                  <div className="text-xs text-slate-400 mb-1">Tokens Procesados</div>
                  <div className="text-lg font-bold text-amber-400">2.4M</div>
                </div>
              </div>
            </div>

            {/* Entrenamiento - Drop Zone */}
            <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Entrenamiento</h2>
              </div>

              {/* Drop Zone */}
              <div className="border-2 border-dashed border-amber-500/40 rounded-lg p-8 text-center hover:border-amber-500/60 hover:bg-amber-500/5 transition-all cursor-pointer group">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-amber-500/10 rounded-full group-hover:bg-amber-500/20 transition-colors">
                    <FileText className="h-8 w-8 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white mb-1">
                      Arrastra tus manuales operativos aquí
                    </div>
                    <div className="text-xs text-slate-400">
                      Para entrenar al modelo con conocimiento específico de tu empresa
                    </div>
                    <div className="text-xs text-amber-400/60 mt-2">
                      PDF, DOCX, TXT (máx. 10MB por archivo)
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentos Procesados */}
              <div className="mt-4 space-y-2">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                  Documentos Procesados
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-slate-300">manual_operativo.pdf</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-slate-300">procesos_internos.docx</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mt-3">
                  <div className="text-xs text-emerald-400 font-medium mb-1">
                    ✓ Conocimiento Absorbido
                  </div>
                  <div className="text-xs text-slate-400">
                    El modelo ahora es experto en tu empresa. 2 documentos procesados.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 shadow-lg shadow-amber-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-amber-400/60 uppercase tracking-wider">Estado</span>
          </div>
          <div className="text-2xl font-bold text-white">Operativo</div>
          <div className="text-xs text-slate-400 mt-1">99.9% uptime</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 shadow-lg shadow-amber-500/10">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-amber-400/60 uppercase tracking-wider">Mensajes</span>
          </div>
          <div className="text-2xl font-bold text-white">1,247</div>
          <div className="text-xs text-slate-400 mt-1">Hoy</div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 shadow-lg shadow-amber-500/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-amber-400/60 uppercase tracking-wider">Satisfacción</span>
          </div>
          <div className="text-2xl font-bold text-white">94.2%</div>
          <div className="text-xs text-slate-400 mt-1">Precisión</div>
        </div>
      </div>
    </div>
  );
}
