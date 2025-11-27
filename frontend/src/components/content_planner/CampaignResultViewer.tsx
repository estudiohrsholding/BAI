"use client";

import { useState } from "react";
import {
  FileText,
  Copy,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Calendar,
  Hash,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/Dialog";
import { ContentCampaignResponse } from "@/lib/api-client";

interface CampaignResultViewerProps {
  campaign: ContentCampaignResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * CampaignResultViewer Component
 *
 * Componente modal para visualizar el contenido generado por n8n.
 * Muestra los posts y reels generados con opción de copiar cada uno.
 */
export function CampaignResultViewer({
  campaign,
  open,
  onOpenChange,
}: CampaignResultViewerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!campaign.generated_content) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogClose onClose={() => onOpenChange(false)} />
          <DialogHeader>
            <DialogTitle>Sin Contenido Generado</DialogTitle>
            <DialogDescription>
              Esta campaña aún no tiene contenido generado.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm text-slate-400">
              El contenido se generará cuando n8n complete el procesamiento.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const content = campaign.generated_content;
  const posts = content.posts || [];
  const reel = content.reel || null;

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Contenido Generado - {campaign.month}</DialogTitle>
          <DialogDescription>
            {posts.length} Posts y {reel ? "1 Reel" : "0 Reels"} generados por IA
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Posts Section */}
          {posts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-400" />
                Posts Generados ({posts.length})
              </h3>
              <div className="space-y-4">
                {posts.map((post: any, index: number) => {
                  // Manejar diferentes formatos de post
                  const postText =
                    post.text ||
                    post.caption ||
                    post.content ||
                    JSON.stringify(post, null, 2);
                  const postTitle = post.title || post.id || `Post ${index + 1}`;
                  const postImage = post.image_url || post.image || null;
                  const postHashtags = post.hashtags || post.tags || [];

                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-900/70 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-violet-400" />
                            {postTitle}
                          </h4>
                          {postImage && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                              <ImageIcon className="h-3 w-3" />
                              <span className="truncate max-w-md">{postImage}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => copyToClipboard(postText, index)}
                          className={cn(
                            "flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                            copiedIndex === index
                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                              : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                          )}
                        >
                          {copiedIndex === index ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copiar
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
                          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {postText}
                          </p>
                        </div>

                        {postHashtags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Hash className="h-3 w-3 text-slate-500" />
                            {postHashtags.map((tag: string, tagIndex: number) => (
                              <span
                                key={tagIndex}
                                className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {post.scheduled_for && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Programado para: {new Date(post.scheduled_for).toLocaleString("es-ES")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reel Section */}
          {reel && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-fuchsia-400" />
                Reel Generado
              </h3>
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                      <Video className="h-4 w-4 text-fuchsia-400" />
                      {reel.title || reel.id || "Reel"}
                    </h4>
                    {reel.video_url && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                        <Video className="h-3 w-3" />
                        <a
                          href={reel.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
                        >
                          {reel.video_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {reel.duration_seconds && (
                      <div className="mt-1 text-xs text-slate-500">
                        Duración: {reel.duration_seconds} segundos
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(reel.text || reel.caption || "", -1)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                      copiedIndex === -1
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    )}
                  >
                    {copiedIndex === -1 ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copiar Texto
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {reel.text || reel.caption || "Sin texto disponible"}
                    </p>
                  </div>

                  {reel.hashtags && reel.hashtags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Hash className="h-3 w-3 text-slate-500" />
                      {reel.hashtags.map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="text-xs text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {reel.scheduled_for && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Programado para: {new Date(reel.scheduled_for).toLocaleString("es-ES")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Metadata Section */}
          {content.generated_at && (
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Generado el: {new Date(content.generated_at).toLocaleString("es-ES")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

