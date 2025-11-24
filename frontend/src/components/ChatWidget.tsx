"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/context/ChatContext";
import { ChatWindow } from "@/components/organisms/ChatWindow";

/**
 * ChatWidget - Floating controller for the chatbot
 * Uses ChatContext to manage visibility state globally
 */
export function ChatWidget() {
  const { isOpen, toggleChat, closeChat } = useChat();

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Chat Window with Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChatWindow isOpen={isOpen} onClose={closeChat} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button with BaiAvatar */}
      <button
        onClick={toggleChat}
        className={cn(
          "flex h-16 w-16 items-center justify-center",
          "rounded-full bg-gradient-to-r from-blue-500 to-purple-600",
          "shadow-xl cursor-pointer",
          "transition-transform duration-300",
          "hover:scale-110",
          "animate-[bounce_2s_ease-in-out_infinite]",
          "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        )}
        role="button"
        aria-label={isOpen ? "Close chat" : "Open B.A.I. chat"}
        tabIndex={0}
      >
        <Bot className="h-8 w-8 text-white" aria-hidden="true" />
      </button>
    </div>
  );
}

