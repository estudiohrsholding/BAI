"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWindow } from "./ChatWindow";

/**
 * B.A.I. Avatar - El componente persistente que representa
 * la presencia del Partner AI en toda la plataforma.
 * Diseñado para estar siempre visible, flotando sobre el contenido.
 */
export function BaiAvatar() {
  const searchParams = useSearchParams();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  // Auto-open chat if automation_consult or software_consult action is present
  useEffect(() => {
    const action = searchParams.get("action");
    if ((action === "automation_consult" || action === "software_consult") && !isChatOpen) {
      setIsChatOpen(true);
    }
  }, [searchParams, isChatOpen]);

  return (
    <>
      <div
        onClick={handleToggleChat}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "flex h-16 w-16 items-center justify-center",
          "rounded-full bg-gradient-to-r from-blue-500 to-purple-600",
          "shadow-xl cursor-pointer",
          "transition-transform duration-300",
          "hover:scale-110",
          "animate-[bounce_2s_ease-in-out_infinite]"
        )}
        role="button"
        aria-label="B.A.I. Partner Avatar"
        tabIndex={0}
      >
        <Bot className="h-8 w-8 text-white" aria-hidden="true" />
      </div>

      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
