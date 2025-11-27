"use client";

import { useState, useEffect } from "react";
import {
  FileJson,
  DatabaseZap,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCircle2,
  Loader2,
  XCircle,
  Globe,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getExtractionQueryResults,
  ExtractionQueryResultsResponse,
  ApiError,
} from "@/lib/api-client";

interface ExtractionResultViewerProps {
  queryId: number;
  onClose?: () => void;
  className?: string;
}

/**
 * ExtractionResultViewer Component
 *
 * Componente para visualizar los resultados estructurados (JSONB) de una query
 * de extracción de datos completada.
 *
 * Muestra los datos en un formato estructurado y visualmente atractivo,
 * con secciones colapsables y visualización de datos clave.
 */
export function ExtractionResultViewer({
  queryId,
  onClose,
  className,
}: ExtractionResultViewerProps) {
  const [results, setResults] = useState<ExtractionQueryResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["summary"]));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getExtractionQueryResults(queryId);
        setResults(data);
        // Expandir secciones principales por defecto
        const defaultSections = new Set<string>();
        if (data.results.summary) defaultSections.add("summary");
        if (data.results.kpis) defaultSections.add("kpis");
        if (data.results.sources) defaultSections.add("sources");
        if (data.results.insights) defaultSections.add("insights");
        setExpandedSections(defaultSections);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message || "Error al cargar los resultados");
        } else {
          setError("Error inesperado al cargar los resultados");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [queryId]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const copyToClipboard = async () => {
    if (!results) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(results.results, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-sm text-slate-400">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-lg border border-red-500/30 bg-red-500/10 p-6", className)}>
        <div className="flex items-center gap-3 mb-2">
          <XCircle className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Error al cargar resultados</h3>
        </div>
        <p className="text-sm text-slate-300">{error}</p>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { results: data, search_topic, completed_at, query_metadata } = results;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
              <DatabaseZap className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Reporte Estructurado</h2>
              <p className="text-sm text-slate-400">{search_topic}</p>
            </div>
          </div>
          {completed_at && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <Calendar className="h-3 w-3" />
              <span>Completado: {new Date(completed_at).toLocaleString("es-ES")}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar JSON
              </>
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {data.summary && (
        <Section
          title="Resumen Ejecutivo"
          icon={TrendingUp}
          isExpanded={expandedSections.has("summary")}
          onToggle={() => toggleSection("summary")}
        >
          <div className="prose prose-invert max-w-none">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {typeof data.summary === "string" ? data.summary : JSON.stringify(data.summary, null, 2)}
            </p>
          </div>
        </Section>
      )}

      {/* Sources Section */}
      {data.sources && Array.isArray(data.sources) && data.sources.length > 0 && (
        <Section
          title={`Fuentes (${data.sources.length})`}
          icon={Globe}
          isExpanded={expandedSections.has("sources")}
          onToggle={() => toggleSection("sources")}
        >
          <div className="space-y-3">
            {data.sources.map((source: any, index: number) => (
              <div
                key={index}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white line-clamp-2">
                    {source.title || source.name || `Fuente ${index + 1}`}
                  </h4>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 flex-shrink-0 text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {source.description && (
                  <p className="text-xs text-slate-400 line-clamp-3 mb-2">
                    {source.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {source.domain && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {source.domain}
                    </span>
                  )}
                  {source.published_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(source.published_date).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Insights Section */}
      {data.insights && Array.isArray(data.insights) && data.insights.length > 0 && (
        <Section
          title={`Insights Clave (${data.insights.length})`}
          icon={TrendingUp}
          isExpanded={expandedSections.has("insights")}
          onToggle={() => toggleSection("insights")}
        >
          <div className="space-y-2">
            {data.insights.map((insight: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <p className="text-sm text-slate-300 flex-1">
                  {typeof insight === "string" ? insight : JSON.stringify(insight, null, 2)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* KPIs Section */}
      {data.kpis && typeof data.kpis === 'object' && Object.keys(data.kpis).length > 0 && (
        <Section
          title="KPIs Clave"
          icon={TrendingUp}
          isExpanded={expandedSections.has("kpis")}
          onToggle={() => toggleSection("kpis")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.kpis).map(([key, value]: [string, any]) => (
              <div
                key={key}
                className="rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-4"
              >
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-3xl font-bold text-white mb-1">
                  {typeof value === "number" ? value.toLocaleString() : String(value)}
                </p>
                {typeof value === "number" && (key.includes("viability") || key.includes("score")) && (
                  <div className="mt-2 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                      style={{ width: `${Math.min(value, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Metrics Section */}
      {data.metrics && typeof data.metrics === 'object' && Object.keys(data.metrics).length > 0 && (
        <Section
          title="Métricas Detalladas"
          icon={TrendingUp}
          isExpanded={expandedSections.has("metrics")}
          onToggle={() => toggleSection("metrics")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.metrics).map(([key, value]) => (
              <div
                key={key}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-4"
              >
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {typeof value === "number" ? value.toLocaleString() : String(value)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Raw JSON Section (Collapsed by default) */}
      <Section
        title="JSON Raw"
        icon={FileJson}
        isExpanded={expandedSections.has("raw")}
        onToggle={() => toggleSection("raw")}
      >
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 overflow-x-auto">
          <pre className="text-xs text-slate-300 font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </Section>

      {/* Metadata Section */}
      {query_metadata && (
        <Section
          title="Metadata de la Query"
          icon={DatabaseZap}
          isExpanded={expandedSections.has("metadata")}
          onToggle={() => toggleSection("metadata")}
        >
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <pre className="text-xs text-slate-300 font-mono">
              {JSON.stringify(query_metadata, null, 2)}
            </pre>
          </div>
        </Section>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, icon: Icon, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-900/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-violet-400" />
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-slate-400" />
        )}
      </button>
      {isExpanded && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

