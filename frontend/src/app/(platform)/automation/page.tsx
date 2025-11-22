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
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load user data");
        }

        const userData = await response.json();
        setUser(userData);

        // Check if user is admin (email check or role check)
        setIsAdmin(
          userData.email === "admin@bai.com" || userData.role === "admin"
        );
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
    <div className="space-y-8">
        {/* Hero Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Centro de Automatización
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Tus agentes digitales están trabajando 24/7.
          </p>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  12.5 Horas
                </p>
                <p className="text-sm text-gray-600">ahorradas este mes</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">142</p>
                <p className="text-sm text-gray-600">Clientes atendidos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Agents Grid */}
        <div>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            Agentes Activos
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Card 1: Recepcionista Web */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recepcionista Web
                </h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              </div>

              {/* Visual Component */}
              <div className="mb-4 flex justify-center">
                <ChatSimulation />
              </div>

              <p className="text-sm text-gray-600">
                Atiende preguntas frecuentes en tu web al instante.
              </p>
            </div>

            {/* Card 2: Gestión de Reputación */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestión de Reputación
                </h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              </div>

              {/* Visual Component */}
              <div className="mb-4 flex justify-center">
                <ReviewSimulation />
              </div>

              <p className="text-sm text-gray-600">
                Responde y agradece reseñas de 5 estrellas en Google.
              </p>
            </div>

            {/* Card 3: Radar de Leads */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Radar de Leads
                </h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              </div>

              {/* Visual Component */}
              <div className="mb-4 flex justify-center">
                <NotificationSimulation />
              </div>

              <p className="text-sm text-gray-600">
                Te avisa al móvil cuando entra un cliente importante.
              </p>
            </div>
          </div>
        </div>

        {/* Tools Integration */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            Herramientas Conectadas (Plan Basic)
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CONNECTED_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const content = (
                <div
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-lg border p-4 transition-all",
                    tool.connected
                      ? "border-green-200 bg-green-50 hover:bg-green-100"
                      : "border-gray-200 bg-gray-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-lg",
                      tool.connected ? "bg-green-100" : "bg-gray-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        tool.connected ? "text-green-600" : "text-gray-400"
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        tool.connected ? "text-gray-900" : "text-gray-500"
                      )}
                    >
                      {tool.name}
                    </p>
                    {tool.connected && (
                      <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Conectado
                      </span>
                    )}
                  </div>
                </div>
              );

              if (tool.link) {
                return (
                  <Link
                    key={tool.name}
                    href={tool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {content}
                  </Link>
                );
              }

              return <div key={tool.name}>{content}</div>;
            })}
          </div>
        </div>

        {/* Request Section */}
        <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                ¿Necesitas automatizar algo más?
              </h3>
              <p className="text-sm text-gray-600">
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
                  href="https://n8n.baibussines.com"
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
      </div>
  );
}
