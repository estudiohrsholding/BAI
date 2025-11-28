/**
 * AppProviders - Combined Providers Pattern
 * 
 * Agrega todos los providers globales de la aplicación en un solo componente
 * para evitar "Provider Hell" (anidamiento profundo) en el layout.
 * 
 * Orden de providers:
 * 1. SWRProvider (más externo) - Maneja data fetching global
 * 2. ChatProvider - Contexto de chat (puede usar SWR)
 * 3. DashboardProvider - Contexto de dashboard (puede usar SWR y Chat)
 * 4. Children - Contenido de la aplicación
 */

"use client";

import { ReactNode } from "react";
import { SWRProvider } from "@/providers/SWRProvider";
import { ChatProvider } from "@/context/ChatContext";
import { DashboardProvider } from "@/context/DashboardContext";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders - Componente agregador de todos los providers globales
 * 
 * @param children - Contenido de la aplicación que necesita acceso a los providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SWRProvider>
      <ChatProvider>
        <DashboardProvider>
          {children}
        </DashboardProvider>
      </ChatProvider>
    </SWRProvider>
  );
}

