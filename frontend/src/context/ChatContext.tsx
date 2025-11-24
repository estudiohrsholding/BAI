"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  isOpen: boolean;
  initialMessage: string | null;
  openChat: (message?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
  clearInitialMessage: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const openChat = (message?: string) => {
    setIsOpen(true);
    if (message) {
      setInitialMessage(message);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setInitialMessage(null);
  };

  const toggleChat = () => setIsOpen((prev) => !prev);

  const clearInitialMessage = () => {
    setInitialMessage(null);
  };

  return (
    <ChatContext.Provider value={{ isOpen, initialMessage, openChat, closeChat, toggleChat, clearInitialMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

