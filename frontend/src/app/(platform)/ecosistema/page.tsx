"use client";

import Link from "next/link";
import { Check, Rocket, Eye, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CATALOG, SoftwareApp } from "./constants";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getMeUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import { PlanIndicator, PlanTier } from "@/components/common/PlanIndicator";

export default function EcosistemaPage() {
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<PlanTier>("MOTOR");
  const [isLoading, setIsLoading] = useState(true);

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

        if (response.ok) {
          const userData = await response.json();
          setUserPlan((userData.plan_tier?.toUpperCase() || "MOTOR") as PlanTier);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Validación defensiva
  if (!APP_CATALOG || !Array.isArray(APP_CATALOG) || APP_CATALOG.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Error al cargar el catálogo de software.</p>
        </div>
      </div>
    );
  }

  const canDeploy = userPlan === "PARTNER";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Ecosistema de Aplicaciones
          </h1>
          <p className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto">
            Biblioteca de componentes y aplicaciones verticales listas para desplegar. Explora las
            vistas previas y despliega cuando estés listo.
          </p>
          {!canDeploy && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
              <Rocket className="h-4 w-4" />
              <span>
                Actualiza a <strong>Partner</strong> para desplegar aplicaciones
              </span>
            </div>
          )}
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...APP_CATALOG]
            .sort((a, b) => {
              // Legendarios primero
              if (a.isLegendary && !b.isLegendary) return -1;
              if (!a.isLegendary && b.isLegendary) return 1;
              return 0;
            })
            .map((app) => (
              <SoftwareCard key={app.id} app={app} canDeploy={canDeploy} userPlan={userPlan} />
            ))}
        </div>
      </div>
    </div>
  );
}

interface SoftwareCardProps {
  app: SoftwareApp;
  canDeploy: boolean;
  userPlan: PlanTier;
}

function SoftwareCard({ app, canDeploy, userPlan }: SoftwareCardProps) {
  const Icon = app.icon;
  const isLegendary = app.isLegendary || false;

  // Detectar si la URL es externa (termina en .html o empieza por http)
  const isExternal = app.demoUrl.includes(".html") || app.demoUrl.startsWith("http");

  return (
    <div
      className={cn(
        "group relative bg-slate-900 rounded-xl",
        "overflow-hidden transition-all duration-300",
        isLegendary
          ? "border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]"
          : "border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50",
        "hover:-translate-y-1"
      )}
    >
      {/* Badge Legendario */}
      {isLegendary && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">
            Core Technology
          </div>
        </div>
      )}

      {/* Borde superior con gradient */}
      <div className={cn("h-1 w-full bg-gradient-to-r", app.gradient)} />

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Icono y Título */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-lg border transition-colors flex-shrink-0",
              isLegendary
                ? "bg-amber-500/20 border-amber-500/40 group-hover:border-amber-500/60"
                : "bg-slate-800 border-slate-700 group-hover:border-slate-600"
            )}
          >
            <Icon
              className={cn("h-6 w-6", isLegendary ? "text-amber-400" : "text-slate-300")}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-1">{app.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{app.sector}</p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-slate-400 text-sm leading-relaxed">{app.description}</p>

        {/* Features List */}
        <div className="space-y-2">
          {app.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-6">
          {/* Preview Button - Always Available */}
          <Link
            href={app.demoUrl}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={cn(
              "block w-full px-4 py-3 rounded-lg",
              "bg-slate-800 border border-slate-700 text-white",
              "font-semibold text-sm text-center",
              "transition-all duration-200",
              "hover:bg-slate-700 hover:border-slate-600",
              "hover:shadow-lg hover:shadow-slate-900/50",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900",
              "flex items-center justify-center gap-2"
            )}
          >
            <Eye className="h-4 w-4" />
            {isExternal ? "Probar en Web Real" : "Ver Demo Interactiva"}
          </Link>

          {/* Deploy Button - Only for PARTNER */}
          {canDeploy ? (
            <button
              className={cn(
                "w-full px-4 py-3 rounded-lg",
                "bg-gradient-to-r from-violet-600 to-purple-600 text-white",
                "font-semibold text-sm text-center",
                "transition-all duration-200",
                "hover:from-violet-500 hover:to-purple-500",
                "hover:shadow-lg hover:shadow-violet-900/50",
                "flex items-center justify-center gap-2"
              )}
            >
              <Rocket className="h-4 w-4" />
              Desplegar Aplicación
            </button>
          ) : (
            <Link
              href="/#pricing"
              className={cn(
                "w-full px-4 py-3 rounded-lg",
                "bg-amber-500/20 border border-amber-500/30 text-amber-400",
                "font-semibold text-sm text-center",
                "transition-all duration-200",
                "hover:bg-amber-500/30 hover:border-amber-500/50",
                "flex items-center justify-center gap-2"
              )}
            >
              <Settings className="h-4 w-4" />
              Actualizar a Partner
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
