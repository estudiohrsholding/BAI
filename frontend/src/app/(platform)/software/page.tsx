"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CATALOG, SoftwareApp } from "./constants";

export default function SoftwarePage() {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Galería de Soluciones
          </h1>
          <p className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto">
            Elige el motor de tu negocio. Nosotros ponemos la inteligencia.
          </p>
        </div>

        {/* Grid de Cards */}
        {/* Ordenar: Legendarios primero, luego el resto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...APP_CATALOG]
            .sort((a, b) => {
              // Legendarios primero
              if (a.isLegendary && !b.isLegendary) return -1;
              if (!a.isLegendary && b.isLegendary) return 1;
              return 0;
            })
            .map((app) => (
              <SoftwareCard key={app.id} app={app} />
            ))}
        </div>
      </div>
    </div>
  );
}

interface SoftwareCardProps {
  app: SoftwareApp;
}

function SoftwareCard({ app }: SoftwareCardProps) {
  const Icon = app.icon;
  const isLegendary = app.isLegendary || false;
  
  // Detectar si la URL es externa (termina en .html o empieza por http)
  const isExternal = app.demoUrl.includes('.html') || app.demoUrl.startsWith('http');

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
      <div
        className={cn(
          "h-1 w-full bg-gradient-to-r",
          app.gradient
        )}
      />

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
              className={cn(
                "h-6 w-6",
                isLegendary ? "text-amber-400" : "text-slate-300"
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-1">{app.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{app.sector}</p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-slate-400 text-sm leading-relaxed">
          {app.description}
        </p>

        {/* Features List */}
        <div className="space-y-2">
          {app.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-sm text-slate-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Botón de Acción */}
        <Link
          href={app.demoUrl}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={cn(
            "block w-full mt-6 px-4 py-3 rounded-lg",
            "bg-slate-800 border border-slate-700 text-white",
            "font-semibold text-sm text-center",
            "transition-all duration-200",
            "hover:bg-slate-700 hover:border-slate-600",
            "hover:shadow-lg hover:shadow-slate-900/50",
            "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          )}
        >
          {isExternal ? "Probar en Web Real" : "Ver Demo Interactiva"}
        </Link>
      </div>
    </div>
  );
}

