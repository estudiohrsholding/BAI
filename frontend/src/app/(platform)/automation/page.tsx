"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  Clock,
  Users,
  Workflow,
  ExternalLink,
  MessageCircle,
  Mail,
  Calendar,
  MessageSquare,
  Sheet,
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

interface User {
  id: number;
  email: string;
  full_name: string | null;
  plan_tier: string;
  is_active: boolean;
  role?: string;
}

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
          // Token is invalid or expired - remove it and redirect to login
          Cookies.remove("bai_token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load user data");
        }

        const userData = await response.json();
        setUser(userData);
        
        // Check if user is admin (RBAC: use role field)
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
    // Navigate to dashboard with automation consultation action
    router.push("/dashboard?action=automation_consult");
  };

  return (
    <PageContainer className="w-full space-y-8">
      {/* Hero Header */}
      <PageItem>
        <div>
          <h1 className="text-4xl font-bold text-white">
            Centro de Automatización
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Tus agentes digitales están trabajando 24/7.
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
              <p className="text-2xl font-bold text-white">
                12.5 Horas
              </p>
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

      {/* Active Agents Grid */}
      <PageItem>
        <h2 className="mb-6 text-2xl font-semibold text-white">
          Agentes Activos
        </h2>
      </PageItem>

      <PageContainer className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card 1: Recepcionista Web */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 shadow-lg transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Recepcionista Web
              </h3>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400">
                Active
              </span>
            </div>

            {/* Visual Component */}
            <div className="mb-4 flex justify-center">
              <ChatSimulation />
            </div>

            <p className="text-sm text-slate-400">
              Atiende preguntas frecuentes en tu web al instante.
            </p>
          </div>
        </PageItem>

        {/* Card 2: Gestión de Reputación */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 shadow-lg transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Gestión de Reputación
              </h3>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400">
                Active
              </span>
            </div>

            {/* Visual Component */}
            <div className="mb-4 flex justify-center">
              <ReviewSimulation />
            </div>

            <p className="text-sm text-slate-400">
              Responde y agradece reseñas de 5 estrellas en Google.
            </p>
          </div>
        </PageItem>

        {/* Card 3: Radar de Leads */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 shadow-lg transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Radar de Leads
              </h3>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400">
                Active
              </span>
            </div>

            {/* Visual Component */}
            <div className="mb-4 flex justify-center">
              <NotificationSimulation />
            </div>

            <p className="text-sm text-slate-400">
              Te avisa al móvil cuando entra un cliente importante.
            </p>
          </div>
        </PageItem>
      </PageContainer>

      {/* Tools Integration */}
      <PageItem>
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Herramientas Conectadas (Plan Basic)
        </h2>
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
                        tool.connected ? "bg-emerald-500/20 border-emerald-500/30" : "bg-slate-800 border-slate-700"
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

                return (
                  <PageItem key={tool.name}>
                    {toolContent}
                  </PageItem>
                );
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

              {/* Admin Button - Only visible for admins */}
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
