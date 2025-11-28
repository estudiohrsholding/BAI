"use client";

import { useState, useEffect } from "react";
import { Loader2, DatabaseZap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getExtractionQueries,
  ExtractionQueryResponse,
  ExtractionQueryStatusResponse,
  ApiError,
} from "@/lib/api-client";
import { QueryStatusItem } from "./QueryStatusItem";

interface ExtractionStatusListProps {
  onStatusUpdate?: (queryId: number, status: ExtractionQueryStatusResponse) => void;
  className?: string;
}

/**
 * ExtractionStatusList Component
 * 
 * Componente para monitorear el estado de las queries de extracción de datos.
 * Hace polling cada 5-10 segundos del endpoint de estado del job de Arq.
 * 
 * Solo visible para usuarios CEREBRO o superior.
 */
export function ExtractionStatusList({
  onStatusUpdate,
  className,
}: ExtractionStatusListProps) {
  const [queries, setQueries] = useState<ExtractionQueryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQueries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getExtractionQueries(50, 0);
      setQueries(response.queries);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al cargar queries"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);
  
  // Función para refrescar la lista manualmente
  const refreshList = () => {
    fetchQueries();
  };


  if (isLoading) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Cargando queries...</p>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : "Error al cargar queries";
    return (
      <div className={cn("rounded-md border border-red-500/30 bg-red-500/10 p-4", className)}>
        <p className="text-sm text-red-400">{errorMessage}</p>
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <DatabaseZap className="h-12 w-12 text-violet-400/50 mx-auto mb-4" />
        <p className="text-sm text-slate-400">
          No tienes queries de extracción aún. Lanza tu primera query arriba.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {queries.map((query) => (
        <QueryStatusItem
          key={query.id}
          query={query}
          onStatusUpdate={(queryId, status) => {
            // Cuando el status de una query activa cambia, refrescar la lista para obtener el estado actualizado
            if (onStatusUpdate) {
              onStatusUpdate(queryId, status);
            }
            // Si cambió a completado, refrescar la lista para obtener resultados
            if (status.query_status === "completed" || status.job_status === "complete") {
              refreshList();
            }
          }}
        />
      ))}
    </div>
  );
}

