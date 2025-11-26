"use client";

import Link from "next/link";
import { Bot, AppWindow, DatabaseZap, ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hola, Socio</h1>
          <p className="text-slate-500 capitalize">{currentDate}</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-600 px-4 py-1 rounded-full text-sm font-medium border border-emerald-500/20 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Sistemas Operativos
        </div>
      </div>

      {/* Grid de Servicios (LAS 3 RAMAS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        
        {/* 1. Automatización */}
        <ServiceCard 
          title="Automatización" 
          desc="Tus agentes IA trabajando 24/7."
          icon={Bot}
          href="/automation"
          color="blue"
          action="Gestionar Flujos"
        />

        {/* 2. Software Studio */}
        <ServiceCard 
          title="Software Studio" 
          desc="Galería de Apps verticales."
          icon={AppWindow}
          href="/software"
          color="violet"
          action="Explorar Catálogo"
          highlight
        />

        {/* 3. Data Mining (NUEVO) */}
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
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 p-12 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-indigo-300 font-semibold mb-1 uppercase tracking-wider text-xs">Tu Plan Actual</div>
            <h2 className="text-3xl font-bold mb-2">BASIC TIER</h2>
            <p className="text-slate-400 max-w-md text-sm">
              Tienes acceso limitado a la galería y automatizaciones simples. Pásate a Premium para desbloquear la Inteligencia Artificial avanzada.
            </p>
          </div>
          
          <Link href="/plans" className="px-6 py-3 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors shadow-lg shadow-white/10 flex items-center gap-2 whitespace-nowrap">
            <TrendingUp className="w-4 h-4" />
            Mejorar a Premium
          </Link>
        </div>
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
    <div className={cn(
      "group p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900",
      highlight ? "border-violet-500 shadow-lg shadow-violet-500/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
    )}>
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{desc}</p>
      <Link href={href} className="inline-flex items-center text-sm font-semibold text-slate-900 dark:text-white group-hover:underline decoration-slate-300 underline-offset-4">
        {action}
        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
