"use client";

import { useState } from "react";
import { Search, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  launchExtractionQuery,
  ExtractionQueryCreateRequest,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/atoms/Button";

interface QueryLaunchFormProps {
  onQueryLaunched?: (queryId: number) => void;
  className?: string;
}

/**
 * QueryLaunchForm Component
 * 
 * Formulario para lanzar nuevas queries de extracción de datos.
 * Solo visible para usuarios CEREBRO o superior (protegido por FeatureGate).
 */
export function QueryLaunchForm({
  onQueryLaunched,
  className,
}: QueryLaunchFormProps) {
  const [searchTopic, setSearchTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTopic.trim()) {
      setError("Por favor ingresa un tema de búsqueda");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const request: ExtractionQueryCreateRequest = {
        search_topic: searchTopic.trim(),
        query_metadata: null,
      };

      const response = await launchExtractionQuery(request);

      setSuccess(`Query lanzada exitosamente. ID: ${response.query_id}`);
      setSearchTopic("");

      // Notificar al componente padre
      if (onQueryLaunched) {
        onQueryLaunched(response.query_id);
      }

      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setError("Esta funcionalidad requiere el plan CEREBRO. Actualiza tu suscripción.");
        } else {
          setError(err.message || "Error al lanzar la query");
        }
      } else {
        setError("Error inesperado al lanzar la query");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6 shadow-lg backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Lanzar Nueva Extracción</h2>
          <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-1 text-xs font-medium text-violet-400">
            Plan Cerebro
          </span>
        </div>
        <p className="mb-6 text-sm text-slate-400">
          Ingresa un tema de búsqueda para generar inteligencia de mercado en tiempo real.
          El análisis se procesará en segundo plano usando Brave Search API y análisis con IA.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="search-topic"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Tema de Búsqueda *
            </label>
            <input
              id="search-topic"
              type="text"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              placeholder="Ej: Inteligencia artificial en retail, Tendencias de marketing digital 2025..."
              maxLength={500}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-3 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-slate-500">
              {searchTopic.length}/500 caracteres
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-emerald-400">{success}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || !searchTopic.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Lanzando Extracción...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Lanzar Extracción de Datos
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

