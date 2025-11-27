"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  Clock,
  Users,
  ExternalLink,
  MessageCircle,
  Mail,
  Calendar,
  MessageSquare,
  Sheet,
  Zap,
  Workflow,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { getMeUrl } from "@/lib/api";
import {
  ChatSimulation,
  ReviewSimulation,
  NotificationSimulation,
} from "@/components/molecules/AutomationVisuals";
import { cn } from "@/lib/utils";
import { PageContainer, PageItem } from "@/components/ui/PageAnimation";
import { useChat } from "@/context/ChatContext";
import { PlanIndicator, PlanTier } from "@/components/common/PlanIndicator";

const PLAN_PRIORITY: PlanTier[] = ["MOTOR", "CEREBRO", "PARTNER"];

interface User {
  id: number;
  email: string;
  full_name: string | null;
  plan_tier: string;
  is_active: boolean;
  role?: string;
}

interface AutomationFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  visual: React.ComponentType;
  requiredPlan: PlanTier;
  category: "basic" | "premium" | "legendary";
}

const AUTOMATION_FEATURES: AutomationFeature[] = [
  {
    id: "web-receptionist",
    name: "Recepcionista Web",
    description: "Atiende preguntas frecuentes en tu web al instante.",
    icon: MessageCircle,
    visual: ChatSimulation,
    requiredPlan: "MOTOR",
    category: "basic",
  },
  {
    id: "review-guardian",
    name: "Guardian de Reseñas",
    description: "Responde y agradece reseñas de 5 estrellas en Google automáticamente.",
    icon: MessageSquare,
    visual: ReviewSimulation,
    requiredPlan: "MOTOR",
    category: "basic",
  },
  {
    id: "lead-radar",
    name: "Radar de Leads",
    description: "Te avisa al móvil cuando entra un cliente importante.",
    icon: Zap,
    visual: NotificationSimulation,
    requiredPlan: "MOTOR",
    category: "basic",
  },
  {
    id: "custom-webhooks",
    name: "Flujos Webhook Personalizados",
    description: "Automatizaciones complejas a medida con integraciones avanzadas.",
    icon: Workflow,
    visual: ChatSimulation,
    requiredPlan: "CEREBRO",
    category: "premium",
  },
  {
    id: "ai-content-scheduler",
    name: "Programador de Contenido IA",
    description: "Crea y programa publicaciones en redes sociales con IA supervisada.",
    icon: Sparkles,
    visual: ReviewSimulation,
    requiredPlan: "CEREBRO",
    category: "premium",
  },
  {
    id: "ai-influencer-creator",
    name: "Creador de Influencers IA",
    description: "Genera y gestiona avatares IA que publican contenido impulsado por Data Mining.",
    icon: Sparkles,
    visual: NotificationSimulation,
    requiredPlan: "PARTNER",
    category: "legendary",
  },
];

interface Tool {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
  link?: string;
}

const CONNECTED_TOOLS: Tool[] = [
  { name: "Gmail", icon: Mail, connected: true },
  { name: "Google Calendar", icon: Calendar, connected: true },
  { name: "WhatsApp", icon: MessageSquare, connected: true, link: "https://wa.me" },
  { name: "Google Sheets", icon: Sheet, connected: true },
];

export default function AutomationPage() {
  const router = useRouter();
  const { openChat } = useChat();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("bai_token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(getMeUrl(), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          Cookies.remove("bai_token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load user data");
        }

        const userData = await response.json();
        setUser(userData);
        setIsAdmin(userData.role === "admin");
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleAskBAI = () => {
    openChat();
  };

  const currentPlan = (user?.plan_tier?.toUpperCase() || "MOTOR") as PlanTier;

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "basic":
        return {
          border: "border-emerald-500/30",
          bg: "bg-emerald-500/10",
          hover: "hover:border-emerald-500/50",
        };
      case "premium":
        return {
          border: "border-violet-500/30",
          bg: "bg-violet-500/10",
          hover: "hover:border-violet-500/50",
        };
      case "legendary":
        return {
          border: "border-amber-500/30",
          bg: "bg-amber-500/10",
          hover: "hover:border-amber-500/50",
        };
      default:
        return {
          border: "border-slate-800",
          bg: "bg-slate-900/80",
          hover: "hover:border-slate-700",
        };
    }
  };

  return (
    <PageContainer className="w-full space-y-8">
      {/* Hero Header */}
      <PageItem>
        <div>
          <h1 className="text-4xl font-bold text-white">Centro de Automatización</h1>
          <p className="mt-2 text-lg text-slate-400">
            Explora el espectro completo de automatizaciones. Desde operaciones básicas hasta
            inteligencia impulsada por datos.
          </p>
        </div>
      </PageItem>

      {/* Stats Row */}
      <PageContainer className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        <PageItem>
          <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur p-4 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Clock className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">12.5 Horas</p>
              <p className="text-sm text-slate-400">ahorradas este mes</p>
            </div>
          </div>
        </PageItem>

        <PageItem>
          <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur p-4 shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Users className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">142</p>
              <p className="text-sm text-slate-400">Clientes atendidos</p>
            </div>
          </div>
        </PageItem>
      </PageContainer>

      {/* Automation Features Grid - Categorized by Plan */}
      <PageItem>
        <h2 className="mb-6 text-2xl font-semibold text-white">Catálogo de Automatizaciones</h2>
        <p className="mb-4 text-sm text-slate-400">
          Las automatizaciones están organizadas por nivel de complejidad y plan requerido.
        </p>
      </PageItem>

      <PageContainer className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {AUTOMATION_FEATURES.map((feature) => {
          const Icon = feature.icon;
          const Visual = feature.visual;
          const styles = getCategoryStyles(feature.category);
          const hasAccess =
            PLAN_PRIORITY.indexOf(currentPlan) >= PLAN_PRIORITY.indexOf(feature.requiredPlan);

          return (
            <PageItem key={feature.id}>
              <div
                className={cn(
                  "rounded-xl border bg-slate-900/80 backdrop-blur p-6 shadow-lg transition-all duration-300",
                  styles.border,
                  styles.bg,
                  styles.hover,
                  "hover:-translate-y-1"
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-slate-300" />
                    <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
                  </div>
                  <PlanIndicator requiredPlan={feature.requiredPlan} currentPlan={currentPlan} />
                </div>

                {/* Visual Component */}
                <div className="mb-4 flex justify-center">
                  <Visual />
                </div>

                <p className="text-sm text-slate-400 mb-4">{feature.description}</p>

                {!hasAccess && (
                  <Link
                    href="/#pricing"
                    className="block w-full mt-4 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold text-sm text-center transition-all hover:bg-slate-700 hover:border-slate-600"
                  >
                    Actualizar Plan
                  </Link>
                )}
              </div>
            </PageItem>
          );
        })}
      </PageContainer>

      {/* Tools Integration */}
      <PageItem>
        <h2 className="mb-4 text-2xl font-semibold text-white">Herramientas Conectadas</h2>
      </PageItem>

      <PageContainer className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {CONNECTED_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const toolContent = (
            <div
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                tool.connected
                  ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                  : "border-slate-800 bg-slate-900/50"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg border",
                  tool.connected
                    ? "bg-emerald-500/20 border-emerald-500/30"
                    : "bg-slate-800 border-slate-700"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6",
                    tool.connected ? "text-emerald-400" : "text-slate-500"
                  )}
                />
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    tool.connected ? "text-white" : "text-slate-500"
                  )}
                >
                  {tool.name}
                </p>
                {tool.connected && (
                  <span className="mt-1 inline-block rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-400">
                    Conectado
                  </span>
                )}
              </div>
            </div>
          );

          if (tool.link) {
            return (
              <PageItem key={tool.name}>
                <Link
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {toolContent}
                </Link>
              </PageItem>
            );
          }

          return <PageItem key={tool.name}>{toolContent}</PageItem>;
        })}
      </PageContainer>

      {/* Request Section */}
      <PageItem>
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-semibold text-white">
                ¿Necesitas automatizar algo más?
              </h3>
              <p className="text-sm text-slate-400">
                Habla con B.A.I. para crear nuevas automatizaciones personalizadas.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAskBAI}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Hablar con B.A.I.</span>
              </Button>

              {isAdmin && (
                <Link
                  href={process.env.NEXT_PUBLIC_N8N_URL || "http://localhost:5678"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <span>Open Workflow Editor</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </PageItem>
    </PageContainer>
  );
}
