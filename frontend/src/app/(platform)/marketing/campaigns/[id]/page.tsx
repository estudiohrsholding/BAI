"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Video,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCampaign, MarketingCampaignDetailResponse, ContentPieceResponse, ApiError } from "@/lib/api-client";

/**
 * Página de Detalle de Campaña de Marketing
 * 
 * Muestra una galería con todas las piezas de contenido generadas (vídeos e imágenes),
 * junto con sus captions y scripts visuales.
 */
export default function MarketingCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = parseInt(params.id as string, 10);

  const [campaign, setCampaign] = useState<MarketingCampaignDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId || isNaN(campaignId)) {
      setError("ID de campaña inválido");
      setIsLoading(false);
      return;
    }

    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCampaign(campaignId);
        setCampaign(data);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setError("Campaña no encontrada");
          } else if (err.status === 401) {
            router.push("/login");
            return;
          } else {
            setError(`Error al cargar la campaña: ${err.message}`);
          }
        } else {
          setError("Error inesperado al cargar la campaña");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-sm text-slate-400">Cargando campaña...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <p className="text-sm text-red-400">{error || "Campaña no encontrada"}</p>
          <button
            onClick={() => router.push("/configuracion")}
            className="mt-4 text-xs text-slate-400 hover:text-slate-300 underline"
          >
            Volver a Configuración
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      COMPLETED: {
        label: "Completado",
        className: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      },
      PENDING: {
        label: "Pendiente",
        className: "text-slate-400 bg-slate-500/20 border-slate-500/30",
      },
      GENERATING: {
        label: "Generando...",
        className: "text-amber-400 bg-amber-500/20 border-amber-500/30",
      },
      FAILED: {
        label: "Error",
        className: "text-red-400 bg-red-500/20 border-red-500/30",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-xs font-medium",
          config.className
        )}
      >
        {config.label}
      </span>
    );
  };

  const handleDownload = (mediaUrl: string, pieceType: string, platform: string) => {
    const link = document.createElement("a");
    link.href = mediaUrl;
    link.download = `${campaign.name}-${platform}-${pieceType}.${mediaUrl.split('.').pop()?.split('?')[0] || 'mp4'}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrar piezas por estado
  const completedPieces = campaign.content_pieces.filter((p) => p.status === "COMPLETED" && p.media_url);
  const pendingPieces = campaign.content_pieces.filter((p) => p.status === "PENDING" || p.status === "GENERATING");
  const failedPieces = campaign.content_pieces.filter((p) => p.status === "FAILED");

  return (
    <div className="w-full space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/configuracion")}
          className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Campaña de marketing con {campaign.content_pieces.length} piezas de contenido
          </p>
        </div>
      </div>

      {/* Información de la Campaña */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Influencer</p>
            <p className="text-sm font-medium text-white">{campaign.influencer_name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Tono de Voz</p>
            <p className="text-sm font-medium text-white capitalize">{campaign.tone_of_voice}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Plataformas</p>
            <p className="text-sm font-medium text-white">{campaign.platforms.join(", ")}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 mb-1">Tema / Contexto</p>
          <p className="text-sm text-slate-300">{campaign.topic}</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="text-xs font-medium text-emerald-400">Completadas</p>
          </div>
          <p className="text-2xl font-bold text-white">{completedPieces.length}</p>
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-amber-400" />
            <p className="text-xs font-medium text-amber-400">En Proceso</p>
          </div>
          <p className="text-2xl font-bold text-white">{pendingPieces.length}</p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-xs font-medium text-red-400">Con Errores</p>
          </div>
          <p className="text-2xl font-bold text-white">{failedPieces.length}</p>
        </div>
      </div>

      {/* Galería de Piezas Completadas */}
      {completedPieces.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Contenido Generado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedPieces.map((piece) => {
              const isVideo = piece.type.toLowerCase().includes("reel") ||
                             piece.type.toLowerCase().includes("video") ||
                             piece.type.toLowerCase().includes("tik tok");

              return (
                <div
                  key={piece.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden hover:border-slate-700 transition-colors"
                >
                  {/* Media Container */}
                  <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
                    {isVideo && piece.media_url ? (
                      <video
                        controls
                        className="w-full h-full object-cover"
                        src={piece.media_url}
                        preload="metadata"
                      />
                    ) : piece.media_url ? (
                      <img
                        src={piece.media_url}
                        alt={`${piece.platform} ${piece.type}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">La IA está cocinando...</p>
                        </div>
                      </div>
                    )}

                    {/* Status Badge Overlay */}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(piece.status)}
                    </div>

                    {/* Download Button */}
                    {piece.media_url && (
                      <button
                        onClick={() => handleDownload(piece.media_url!, piece.type, piece.platform)}
                        className="absolute bottom-2 right-2 rounded-md bg-slate-900/80 hover:bg-slate-800 p-2 text-white transition-colors"
                        aria-label="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isVideo ? (
                          <Video className="h-4 w-4 text-violet-400" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-emerald-400" />
                        )}
                        <span className="text-xs font-medium text-slate-300">{piece.platform}</span>
                      </div>
                      <span className="text-xs text-slate-500">{piece.type}</span>
                    </div>

                    {/* Caption */}
                    <div className="rounded-md bg-slate-800/50 p-3">
                      <p className="text-xs font-medium text-slate-400 mb-1">Caption</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{piece.caption}</p>
                    </div>

                    {/* Visual Script */}
                    <div className="rounded-md bg-slate-800/50 p-3">
                      <p className="text-xs font-medium text-slate-400 mb-1">Script Visual</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{piece.visual_script}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Piezas Pendientes */}
      {pendingPieces.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">En Proceso de Generación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingPieces.map((piece) => {
              const isVideo = piece.type.toLowerCase().includes("reel") ||
                             piece.type.toLowerCase().includes("video") ||
                             piece.type.toLowerCase().includes("tik tok");

              return (
                <div
                  key={piece.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
                >
                  {/* Skeleton Loader */}
                  <div className="relative aspect-[9/16] bg-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">La IA está cocinando...</p>
                      {piece.status === "GENERATING" && (
                        <p className="text-xs text-amber-400 mt-1">Generando {isVideo ? "vídeo" : "imagen"}...</p>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isVideo ? (
                          <Video className="h-4 w-4 text-violet-400/50" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-emerald-400/50" />
                        )}
                        <span className="text-xs font-medium text-slate-400">{piece.platform}</span>
                      </div>
                      <span className="text-xs text-slate-500">{piece.type}</span>
                    </div>

                    {/* Caption Preview */}
                    <div className="rounded-md bg-slate-800/50 p-3">
                      <p className="text-xs font-medium text-slate-400 mb-1">Caption</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap line-clamp-3">{piece.caption}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Piezas con Error */}
      {failedPieces.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Piezas con Errores</h2>
          <div className="space-y-3">
            {failedPieces.map((piece) => (
              <div
                key={piece.id}
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-white">
                      {piece.platform} - {piece.type}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-2">Caption: {piece.caption.substring(0, 100)}...</p>
                <p className="text-xs text-red-400">
                  Esta pieza falló al generar. Por favor, inténtalo de nuevo.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado Vacío */}
      {campaign.content_pieces.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-slate-800 bg-slate-900/50">
          <ImageIcon className="h-12 w-12 text-slate-400/50 mx-auto mb-4" />
          <p className="text-sm text-slate-400">
            Aún no hay piezas de contenido generadas para esta campaña.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            El contenido se generará automáticamente en segundo plano.
          </p>
        </div>
      )}
    </div>
  );
}

