"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/organisms/Sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
  isFullWidth?: boolean;
}

export function DashboardShell({ children, isFullWidth = false }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // BLOQUE 1: Contenedor Raíz (Sin Flexbox para evitar conflictos)
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-x-hidden">
      
      {/* Cabecera Móvil (Solo visible en móviles) */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-slate-900 border-b border-slate-800 px-4 md:hidden">
        <h1 className="text-xl font-bold tracking-wide text-violet-400">B.A.I.</h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar (Fijo a la izquierda) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* BLOQUE 2: Contenido Principal */}
      {/* md:ml-64 -> Margen izquierdo de 256px para saltar el Sidebar */}
      {/* w-auto -> Ancho automático para rellenar lo que sobra */}
      <main
        className={cn(
          "min-h-screen transition-all duration-200 ease-in-out",
          "md:ml-64", 
          "w-auto",
          "pt-16 md:pt-0",
          isFullWidth ? "p-0" : "p-4 md:p-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}
