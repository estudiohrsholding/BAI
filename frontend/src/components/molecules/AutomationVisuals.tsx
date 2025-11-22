"use client";

import { Star, Bell, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ChatSimulation - A small chat window widget showing user-bot interaction
 */
export function ChatSimulation() {
  return (
    <div className="w-full max-w-xs rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {/* Chat Header */}
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-xs font-medium text-slate-600">Chat en Vivo</span>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {/* User Message */}
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg rounded-tl-none bg-slate-100 px-3 py-2">
            <p className="text-xs text-slate-700">Hola, ¿a qué hora abrís?</p>
          </div>
        </div>

        {/* Bot Message with pulse animation */}
        <div className="flex justify-end">
          <div
            className={cn(
              "max-w-[80%] rounded-lg rounded-tr-none bg-blue-500 px-3 py-2",
              "animate-pulse"
            )}
          >
            <p className="text-xs text-white">¡Hola! Abrimos de 09:00 a 21:00.</p>
          </div>
        </div>
      </div>

      {/* Typing indicator */}
      <div className="mt-3 flex items-center gap-1 text-slate-400">
        <div className="h-1 w-1 animate-pulse rounded-full bg-slate-400" />
        <div className="h-1 w-1 animate-pulse rounded-full bg-slate-400 delay-75" />
        <div className="h-1 w-1 animate-pulse rounded-full bg-slate-400 delay-150" />
      </div>
    </div>
  );
}

/**
 * ReviewSimulation - A Google Review card with auto-reply
 */
export function ReviewSimulation() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {/* Review Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs font-medium text-slate-600">Google Review</span>
      </div>

      {/* Review Text */}
      <p className="mb-3 text-sm text-slate-700">La comida excelente...</p>

      {/* Auto-Reply Box */}
      <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-3 pl-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-700">🤖 B.A.I.:</span>
        </div>
        <p className="text-xs text-blue-800">
          ¡Gracias! Nos alegra que te guste.
        </p>
      </div>
    </div>
  );
}

/**
 * NotificationSimulation - A phone push notification widget
 */
export function NotificationSimulation() {
  return (
    <div className="w-full max-w-xs rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {/* Notification Header */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <Bell className="h-5 w-5 text-blue-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">
              Nuevo Cliente Potencial
            </span>
            <span className="text-xs text-slate-400">ahora</span>
          </div>
          <p className="text-xs text-slate-600">
            Juan ha rellenado el formulario de contacto.
          </p>
        </div>
      </div>

      {/* Notification Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-xs text-slate-500">B.A.I. Automation</span>
        <div className="h-2 w-2 rounded-full bg-blue-500" />
      </div>
    </div>
  );
}

