"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { APP_CATALOG } from "../../ecosistema/constants";
import { ArrowLeft, User, Store, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDashboardComponent,
  hasDashboardComponent,
} from "@/components/modules/registry";

// Definimos los 3 Roles del protocolo Skeleton
type UserRole = "guest" | "client" | "owner";

export default function DemoPage({ params }: { params: { appId: string } }) {
  // 1. Buscamos la App en el catálogo
  const app = APP_CATALOG.find((a) => a.id === params.appId);

  // Estado para el simulador de roles
  const [currentRole, setCurrentRole] = useState<UserRole>("owner");

  // Si la app no existe en el catálogo, lanzamos 404
  if (!app) {
    notFound();
  }

  const Icon = app.icon;

  // Obtener el componente Dashboard específico si existe
  const SpecificDashboard = hasDashboardComponent(params.appId)
    ? getDashboardComponent(params.appId)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* --- BARRA DE CONTROL DE LA DEMO (SIMULADOR) --- */}
      {/* Esta barra se muestra sobre el contenido, el Sidebar ya está en el layout */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 shadow-md -mx-4 md:-mx-8 mb-6">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Identidad de la App Actual */}
          <div className="flex items-center gap-3">
            <Link
              href="/ecosistema"
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className={cn("p-2 rounded-lg bg-gradient-to-br", app.gradient)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">{app.name}</h1>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                Demo Mode
              </span>
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

      {/* --- CONTENIDO PRINCIPAL --- */}
      {/* El Sidebar ya está renderizado por el layout, solo mostramos el contenido */}
      <div className="flex-1 overflow-y-auto">
        {/* Renderizado condicional: Si existe un Dashboard específico y el rol es 'owner', mostrarlo */}
        {/* Esto incluye: cannabiapp, restaurantiapp, neural-core, etc. */}
        {SpecificDashboard && currentRole === "owner" ? (
          <div className="-mx-4 md:-mx-8">
            <SpecificDashboard />
          </div>
        ) : (
          /* Fallback: Vista genérica para otros roles o apps sin dashboard específico */
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Mensaje de Contexto */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-400 text-sm">
              <span className="font-bold">Vista Actual: {currentRole.toUpperCase()}.</span>{" "}
              Estás viendo la interfaz que vería un{" "}
              {currentRole === "guest"
                ? "usuario anónimo visitando la web"
                : currentRole === "client"
                  ? "usuario registrado en su perfil"
                  : "dueño del negocio gestionando datos"}
              .
              {currentRole !== "owner" && (
                <div className="mt-2 text-xs opacity-80">
                  💡 Cambia a "Dueño (Admin)" para ver el dashboard completo
                </div>
              )}
            </div>

            {/* Contenido Simulado según App y Rol */}
            <div className="grid gap-6">
              {/* Bloque 1: Hero / Resumen */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {currentRole === "guest"
                    ? `Bienvenido a ${app.name}`
                    : currentRole === "client"
                      ? `Hola, Usuario`
                      : `Panel de Control`}
                </h2>
                <p className="text-slate-400">
                  {currentRole === "guest"
                    ? app.description
                    : currentRole === "client"
                      ? "Aquí tienes tus puntos de fidelidad y tus últimas reservas."
                      : "Resumen de actividad de hoy: 14 ventas, 3 nuevos clientes."}
                </p>

                {/* Botón de acción simulado */}
                <div className="mt-6">
                  <button
                    className={cn(
                      "px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90 bg-gradient-to-r",
                      app.gradient
                    )}
                  >
                    {currentRole === "guest"
                      ? "Registrarme o Reservar"
                      : currentRole === "client"
                        ? "Ver mis Pedidos"
                        : "Ver Informe IA"}
                  </button>
                </div>
              </div>

              {/* Bloque 2: Features específicas de la App */}
              <div className="grid md:grid-cols-3 gap-4">
                {app.features.map((feature, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 p-4 rounded-lg border border-slate-800"
                  >
                    <div className="text-sm font-semibold text-white mb-1">{feature}</div>
                    <div className="text-xs text-slate-500">Módulo activo en {app.name}</div>
                  </div>
                ))}
              </div>

              {/* Vista específica para Cliente */}
              {currentRole === "client" && (
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Mi Perfil</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <span className="text-slate-300">Puntos de Fidelidad</span>
                      <span className="text-xl font-bold text-violet-400">1,250 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                      <span className="text-slate-300">Última Visita</span>
                      <span className="text-slate-400">Hace 3 días</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Vista específica para Invitado */}
              {currentRole === "guest" && (
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
                  <h3 className="text-lg font-semibold text-white mb-4">¿Por qué {app.name}?</h3>
                  <ul className="space-y-3">
                    {app.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponente para los botones del switch
function RoleButton({
  role,
  current,
  setRole,
  icon: Icon,
  label,
}: {
  role: UserRole;
  current: UserRole;
  setRole: (role: UserRole) => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
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
  );
}
