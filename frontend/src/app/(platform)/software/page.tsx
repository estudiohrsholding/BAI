"use client";

import { useRouter } from "next/navigation";
import {
  AppWindow,
  Bot,
  Star,
  Calendar,
  Smartphone,
  Image as ImageIcon,
  Video,
  Share2,
  Globe,
  BrainCircuit,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- NIVEL 1: BASIC (RECEPCIONISTA OMNICANAL) ---
const BASIC_TOOLS = [
  {
    id: "chatbot_omni",
    title: "Chatbot Omnicanal",
    desc: "Núcleo de IA que unifica Web, Instagram y Facebook Messenger en una sola bandeja.",
    icon: Bot,
  },
  {
    id: "review_guard",
    title: "Guardián de Reseñas",
    desc: "Sistema automático que detecta reseñas en Google Maps y responde agradeciendo o alertando.",
    icon: Star,
  },
  {
    id: "smart_booking",
    title: "Motor de Reservas",
    desc: "Gestión de citas sincronizada con Google Calendar. Evita el 'no-show' con recordatorios.",
    icon: Calendar,
  },
];

// --- NIVEL 2: PREMIUM (AGENCIA DE MARKETING IA) ---
const PREMIUM_TOOLS = [
  {
    id: "whatsapp_biz",
    title: "WhatsApp Connector",
    desc: "Integración profunda con WhatsApp Business para ventas y recuperación de carritos.",
    icon: Smartphone,
  },
  {
    id: "content_studio",
    title: "Estudio de Contenido",
    desc: "Generación automática de Copywriting persuasivo y Posts visuales para redes.",
    icon: ImageIcon,
  },
  {
    id: "video_forge",
    title: "Video Marketing AI",
    desc: "Creación de Reels y TikToks automáticos usando avatares y voces sintéticas.",
    icon: Video,
  },
  {
    id: "social_autopilot",
    title: "Auto-Publicador",
    desc: "Programación y publicación desatendida en todas tus redes sociales.",
    icon: Share2,
  },
  {
    id: "trend_radar",
    title: "Radar de Tendencias",
    desc: "Data Mining que detecta temas virales en tiempo real para adaptar tu contenido.",
    icon: Globe,
  },
];

// --- NIVEL 3: ENTERPRISE (DOMINIO DE MERCADO) ---
const ENTERPRISE_TOOLS = [
  {
    id: "custom_llm",
    title: "Neural Core Propio",
    desc: "Fine-tuning de modelos LLM entrenados exclusivamente con tus datos históricos.",
    icon: BrainCircuit,
  },
  {
    id: "market_sniper",
    title: "Sniper de Mercado",
    desc: "Extracción masiva de datos de competidores y ajuste dinámico de estrategias.",
    icon: Zap,
  },
  {
    id: "security_vault",
    title: "Bóveda de Datos",
    desc: "Infraestructura dedicada con encriptación militar y soberanía de datos total.",
    icon: Shield,
  },
];

export default function SoftwarePage() {
  const router = useRouter();

  const handleViewDetails = (itemId: string) => {
    router.push(`/dashboard?action=software_consult&item=${itemId}`);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] bg-slate-950 text-white overflow-x-hidden -m-8 p-8">
      {/* Dark Background with Spotlight Effect */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
      </div>

      <div className="relative w-full px-6 md:px-10 py-12 md:py-20 space-y-16">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <AppWindow className="w-10 h-10 text-violet-400" />
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Catálogo de Herramientas
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Desglosamos nuestra tecnología pieza a pieza. Aquí tienes los motores que impulsan tus
            planes.
          </p>
        </div>

        {/* --- NIVEL 1: BASIC (Verde) --- */}
        <section>
          <div className="flex items-center gap-4 mb-8 border-b border-emerald-500/20 pb-4">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
              Incluido en Basic
            </span>
            <h2 className="text-2xl font-bold text-emerald-400">Fundamentos Operativos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BASIC_TOOLS.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className={cn(
                    "group relative bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-xl",
                    "transition-all duration-300 hover:border-emerald-500/50",
                    "hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
                  )}
                >
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 w-fit rounded-lg mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{mod.title}</h3>
                  <p className="text-sm text-slate-400 mb-5 min-h-[40px] leading-relaxed">
                    {mod.desc}
                  </p>
                  <button
                    onClick={() => handleViewDetails(mod.id)}
                    className="text-sm font-semibold text-emerald-400 flex items-center gap-2 hover:gap-3 transition-all hover:text-emerald-300"
                  >
                    Ver Detalles <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- NIVEL 2: PREMIUM (Morado - Highlight) --- */}
        <section className="relative">
          {/* Fondo sutil para destacar la sección Premium */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 rounded-3xl -m-6 z-0 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8 border-b border-violet-500/20 pb-4 pt-4 md:pt-0">
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg shadow-violet-500/30 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Incluido en Premium
              </span>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Suite de Marketing IA
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PREMIUM_TOOLS.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    className={cn(
                      "group relative bg-slate-900/90 backdrop-blur border border-slate-800 p-6 rounded-xl",
                      "transition-all duration-300 hover:-translate-y-1 overflow-hidden shadow-xl",
                      "hover:border-violet-500/50 hover:shadow-violet-500/20"
                    )}
                  >
                    {/* Efectos Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    <div className="relative z-10">
                      <div className="p-3 bg-slate-800 w-fit rounded-lg mb-4 border border-slate-700 group-hover:border-violet-500/50 transition-colors">
                        <Icon className="w-6 h-6 text-violet-300" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{mod.title}</h3>
                      <p className="text-sm text-slate-400 mb-5 min-h-[40px] leading-relaxed">
                        {mod.desc}
                      </p>
                      <button
                        onClick={() => handleViewDetails(mod.id)}
                        className="text-sm font-semibold text-violet-300 flex items-center gap-2 hover:gap-3 transition-all hover:text-white"
                      >
                        Solicitar Demo <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- NIVEL 3: ENTERPRISE (Dorado) --- */}
        <section>
          <div className="flex items-center gap-4 mb-8 border-b border-amber-500/20 pb-4 pt-8">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.4)] flex items-center gap-2">
              <Lock className="w-3 h-3" /> Enterprise Only
            </span>
            <h2 className="text-2xl font-bold text-amber-400">Tecnología de Vanguardia</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ENTERPRISE_TOOLS.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className={cn(
                    "group relative bg-black border-2 border-amber-900/30 p-6 rounded-xl",
                    "transition-all duration-500 hover:border-amber-500/50",
                    "hover:shadow-2xl hover:shadow-amber-500/20"
                  )}
                >
                  <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors rounded-xl" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-amber-900/20 w-fit rounded-lg border border-amber-500/20">
                        <Icon className="w-6 h-6 text-amber-400" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-amber-100 mb-2">{mod.title}</h3>
                    <p className="text-sm text-amber-500/70 mb-5 min-h-[40px] leading-relaxed">
                      {mod.desc}
                    </p>

                    <button
                      onClick={() => handleViewDetails(mod.id)}
                      className="w-full py-2 bg-transparent border border-amber-600/30 rounded text-amber-400 text-xs font-bold uppercase tracking-widest hover:bg-amber-600 hover:text-black transition-all flex items-center justify-center gap-2"
                    >
                      Consultar Acceso
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
