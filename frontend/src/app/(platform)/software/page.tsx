"use client";

import { useRouter } from "next/navigation";
import {
  Bot,
  Star,
  Calendar,
  Smartphone,
  Image,
  Video,
  Share2,
  Globe,
  BrainCircuit,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BASIC_TOOLS: Tool[] = [
  {
    id: "chatbot-omnicanal",
    name: "Chatbot Omnicanal",
    description: "Núcleo de IA que unifica Web, Instagram y Facebook en una sola bandeja.",
    icon: Bot,
  },
  {
    id: "guardian-resenas",
    name: "Guardián de Reseñas",
    description: "Detecta reseñas en Google Maps y responde automáticamente.",
    icon: Star,
  },
  {
    id: "motor-reservas",
    name: "Motor de Reservas",
    description: "Gestión de citas sincronizada con Google Calendar.",
    icon: Calendar,
  },
];

const PREMIUM_TOOLS: Tool[] = [
  {
    id: "whatsapp-connector",
    name: "WhatsApp Connector",
    description: "Ventas y recuperación de carritos vía WhatsApp Business.",
    icon: Smartphone,
  },
  {
    id: "estudio-contenido",
    name: "Estudio de Contenido",
    description: "Generación de Posts visuales y Copywriting persuasivo.",
    icon: Image,
  },
  {
    id: "video-marketing-ai",
    name: "Video Marketing AI",
    description: "Creación de Reels y TikToks con avatares sintéticos.",
    icon: Video,
  },
  {
    id: "auto-publicador",
    name: "Auto-Publicador",
    description: "Programación desatendida en redes sociales.",
    icon: Share2,
  },
  {
    id: "radar-tendencias",
    name: "Radar de Tendencias",
    description: "Data Mining para detectar temas virales.",
    icon: Globe,
  },
];

const ENTERPRISE_TOOLS: Tool[] = [
  {
    id: "neural-core",
    name: "Neural Core Propio",
    description: "LLM entrenado exclusivamente con tus datos.",
    icon: BrainCircuit,
  },
  {
    id: "sniper-mercado",
    name: "Sniper de Mercado",
    description: "Extracción masiva de datos de competidores.",
    icon: Zap,
  },
  {
    id: "boveda-datos",
    name: "Bóveda de Datos",
    description: "Infraestructura dedicada con encriptación militar.",
    icon: Shield,
  },
];

export default function SoftwarePage() {
  const router = useRouter();

  const handleViewDetails = (itemId: string) => {
    router.push(`/dashboard?action=software_consult&item=${itemId}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Catálogo de Herramientas</h1>
        <p className="mt-2 text-lg text-gray-600">
          Descubre las herramientas que potencian cada plan. Elige tu nivel y accede a estas
          funcionalidades.
        </p>
      </div>

      {/* BASIC TOOLS Section */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200">
            Incluido en Basic
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BASIC_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border",
                  "bg-white border-emerald-200 p-6 shadow-sm",
                  "transition-all duration-300 hover:shadow-md hover:border-emerald-400"
                )}
              >
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{tool.name}</h3>
                <p className="mb-4 text-sm text-gray-600">{tool.description}</p>

                {/* Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(tool.id)}
                  className="w-full border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500"
                >
                  Ver Detalles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* PREMIUM TOOLS Section */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 px-4 py-2 text-sm font-semibold text-violet-700 border border-violet-300">
            Incluido en Premium
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PREMIUM_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border",
                  "bg-slate-900/90 backdrop-blur border-violet-500/30 p-6 shadow-lg",
                  "transition-all duration-300 hover:shadow-xl hover:border-violet-500/50",
                  "hover:shadow-violet-500/20"
                )}
              >
                {/* Magical Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />

                {/* Icon with Gradient Background */}
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                  <Icon className="h-6 w-6 text-violet-400" />
                </div>

                {/* Content */}
                <h3 className="relative mb-2 text-lg font-semibold text-white">{tool.name}</h3>
                <p className="relative mb-4 text-sm text-slate-300">{tool.description}</p>

                {/* Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(tool.id)}
                  className="relative w-full border-violet-500/50 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400 hover:text-violet-200"
                >
                  Ver Detalles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ENTERPRISE TOOLS Section */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 border border-amber-300">
            Incluido en Enterprise
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ENTERPRISE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border-2",
                  "bg-black border-amber-400/50 p-6 shadow-2xl",
                  "transition-all duration-300 hover:shadow-amber-500/50 hover:border-amber-400",
                  "before:absolute before:-inset-1 before:rounded-lg",
                  "before:bg-gradient-to-r before:from-amber-400 before:via-yellow-400 before:to-amber-400",
                  "before:opacity-0 before:blur-xl before:transition-opacity",
                  "group-hover:before:opacity-30"
                )}
              >
                {/* Icon */}
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                  <Icon className="h-6 w-6 text-amber-400" />
                </div>

                {/* Content */}
                <h3
                  className={cn(
                    "relative mb-2 text-lg font-semibold",
                    "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400",
                    "bg-clip-text text-transparent"
                  )}
                >
                  {tool.name}
                </h3>
                <p className="relative mb-4 text-sm text-slate-400">{tool.description}</p>

                {/* Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(tool.id)}
                  className="relative w-full border-amber-400/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-300"
                >
                  Ver Detalles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
