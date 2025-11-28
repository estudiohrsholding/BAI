/**
 * SWR Provider - Configuración Global de SWR
 * 
 * Provider para configurar opciones globales de SWR:
 * - Revalidación inteligente
 * - Error handling centralizado
 * - Configuración de fetcher por defecto
 */

"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { apiGet } from "@/lib/api-client";

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // No revalidar automáticamente al cambiar de pestaña (mejor para performance)
        revalidateOnFocus: false,
        
        // Revalidar al reconectar (útil si se perdió conexión)
        revalidateOnReconnect: true,
        
        // Retry automático en caso de error
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 2000,
        
        // Mantener datos anteriores mientras carga nueva data (mejor UX)
        keepPreviousData: true,
        
        // Deduplicación de requests (evita requests duplicados)
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  );
}

