"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { APP_CATALOG } from "../../software/constants"; // Importamos el catálogo
import { ArrowLeft, User, LayoutDashboard, Store, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Definimos los 3 Roles del protocolo Skeleton
type UserRole = "guest" | "client" | "owner";

export default function DemoPage({ params }: { params: { appId: string } }) {
  // 1. Buscamos la App en el catálogo
  const app = APP_CATALOG.find((a) => a.id === params.appId);
  
  // Estado para el simulador de roles
  const [currentRole, setCurrentRole] = useState<UserRole>("guest");

  // Si la app no existe en el catálogo, lanzamos 404
  if (!app) {
    notFound();
  }

  const Icon = app.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* --- BARRA DE CONTROL DE LA DEMO (SIMULADOR) --- */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Identidad de la App Actual */}
          <div className="flex items-center gap-3">
            <Link 
              href="/software" 
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className={cn("p-2 rounded-lg bg-gradient-to-br", app.gradient)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">{app.name}</h1>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Demo Mode</span>
            </div>
          </div>

          {/* Selector de Roles (El Switch Mágico) */}
          <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800">
            <RoleButton 
              role="guest" 
              current={currentRole} 
              setRole={setCurrentRole} 
              icon={Store} 
              label="Invitado" 
            />
            <RoleButton 
              role="client" 
              current={currentRole} 
              setRole={setCurrentRole} 
              icon={User} 
              label="Cliente" 
            />
            <RoleButton 
              role="owner" 
              current={currentRole} 
              setRole={setCurrentRole} 
              icon={ShieldCheck} 
              label="Dueño (Admin)" 
            />
          </div>
        </div>
      </div>

      {/* --- EL ESQUELETO DE LA APP (CONTENIDO DINÁMICO) --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Falso (Solo visible para Admin/Owner) */}
        {currentRole === 'owner' && (
          <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:block p-4 space-y-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Menú de Gestión
            </div>
            <div className="space-y-1">
               {['Dashboard', 'Ventas', 'Usuarios', 'Configuración', 'IA Analytics'].map((item) => (
                 <div key={item} className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-sm font-medium">{item}</span>
                 </div>
               ))}
            </div>
          </aside>
        )}

        {/* Área Principal */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50 dark:bg-black/20">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Mensaje de Contexto (Solo para entender qué pasa) */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-600 dark:text-blue-400 text-sm">
              <span className="font-bold">Vista Actual: {currentRole.toUpperCase()}.</span> 
              {" "} Estás viendo la interfaz que vería un {currentRole === 'guest' ? 'usuario anónimo visitando la web' : currentRole === 'client' ? 'usuario registrado en su perfil' : 'dueño del negocio gestionando datos'}.
            </div>

            {/* Contenido Simulado según App */}
            <div className="grid gap-6">
              {/* Bloque 1: Hero / Resumen */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                   {currentRole === 'guest' ? `Bienvenido a ${app.name}` : currentRole === 'client' ? `Hola, Usuario` : `Panel de Control`}
                 </h2>
                 <p className="text-slate-500">
                   {currentRole === 'guest' 
                      ? app.description 
                      : currentRole === 'client' 
                        ? 'Aquí tienes tus puntos de fidelidad y tus últimas reservas.' 
                        : 'Resumen de actividad de hoy: 14 ventas, 3 nuevos clientes.'}
                 </p>

                 {/* Botón de acción simulado */}
                 <div className="mt-6">
                   <button className={cn("px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90 bg-gradient-to-r", app.gradient)}>
                      {currentRole === 'guest' ? 'Registrarme o Reservar' : currentRole === 'client' ? 'Ver mis Pedidos' : 'Ver Informe IA'}
                   </button>
                 </div>
              </div>

              {/* Bloque 2: Features específicas de la App */}
              <div className="grid md:grid-cols-3 gap-4">
                 {app.features.map((feature, i) => (
                   <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{feature}</div>
                      <div className="text-xs text-slate-500">Módulo activo en {app.name}</div>
                   </div>
                 ))}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Subcomponente para los botones del switch
function RoleButton({ role, current, setRole, icon: Icon, label }: any) {
  const isActive = current === role;
  return (
    <button
      onClick={() => setRole(role)}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
        isActive 
          ? "bg-slate-800 text-white shadow-sm" 
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}