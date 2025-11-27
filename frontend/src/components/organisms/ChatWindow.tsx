"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { apiGet, apiPost, ApiError } from "@/lib/api-client";
import { useDashboard } from "@/context/DashboardContext";
import { useChat } from "@/context/ChatContext";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "bot";
  text: string;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadScenario } = useDashboard();
  const { initialMessage, clearInitialMessage } = useChat();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [hasTriggeredDashboard, setHasTriggeredDashboard] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    if (!isOpen) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        // Usar cliente API centralizado con autenticación automática
        const history = await apiGet<Array<{ role: string; content: string }>>(
          "/api/chat/history"
        );

        if (history.length === 0) {
          // Only show welcome message if no history exists
          setMessages([
            {
              role: "bot",
              text: "¡Hola! Estoy operativo. ¿En qué servicio nos enfocamos hoy?"
            }
          ]);
        } else {
          // Map backend format to frontend format
          // Backend role "bai" -> Frontend role "bot"
          const mappedMessages: Message[] = history.map((msg: { role: string; content: string }) => ({
            role: msg.role === "bai" ? "bot" : (msg.role === "user" ? "user" : "bot"),
            text: msg.content
          }));
          setMessages(mappedMessages);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        
        // Manejar error de autenticación
        if (error instanceof ApiError && error.status === 401) {
          Cookies.remove("bai_token");
          router.push("/login");
          return;
        }
        
        // Show welcome message on error
        setMessages([
          {
            role: "bot",
            text: "¡Hola! Estoy operativo. ¿En qué servicio nos enfocamos hoy?"
          }
        ]);
      } finally {
        setIsLoadingHistory(false);
        // Scroll to bottom after history is loaded
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    loadHistory();
  }, [isOpen, router]);

  // Handle initial message from context (e.g., from Data page)
  useEffect(() => {
    if (!isOpen || isLoadingHistory || !initialMessage) return;

    // Add initial message as bot message
    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        text: initialMessage,
      },
    ]);

    // Clear the initial message so it doesn't repeat
    clearInitialMessage();

    // Scroll to bottom to show the new message
    setTimeout(() => scrollToBottom(), 100);
  }, [initialMessage, isOpen, isLoadingHistory, clearInitialMessage]);

  // Auto-send function for programmatic use (memoized with useCallback)
  // Using ref for isLoading to avoid recreating function on every state change
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoadingRef.current) return;

    // Add user message immediately
    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      // Usar cliente API centralizado con autenticación automática
      const data = await apiPost<{ response: string }>(
        "/api/chat",
        { text: messageText }
      );
      const botResponse = data.response;
      setMessages((prev) => [...prev, { role: "bot", text: botResponse }]);
      
      // Check if bot says the "success phrase" to trigger dashboard update
      if (!hasTriggeredDashboard) {
        const successPhrases = [
          "estoy preparando tu informe",
          "enviándolo a tu correo",
          "enviándolo a tu correo electrónico",
          "preparando tu informe de automatización",
          "informe personalizado"
        ];
        
        const responseLower = botResponse.toLowerCase();
        const containsSuccessPhrase = successPhrases.some(phrase => 
          responseLower.includes(phrase)
        );
        
        if (containsSuccessPhrase) {
          loadScenario("hair_salon");
          setHasTriggeredDashboard(true);
        }
      }
    } catch (error) {
      // Manejar error de autenticación
      if (error instanceof ApiError && error.status === 401) {
        Cookies.remove("bai_token");
        router.push("/login");
        return;
      }
      
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo." }
      ]);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [router]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");

    // Use the shared sendMessage function
    await sendMessage(userMessage);
  };

  // Auto-open and auto-send for automation or software consultation
  useEffect(() => {
    if (!isOpen || isLoadingHistory) return;

    const action = searchParams.get("action");
    const module = searchParams.get("module");
    
    if (action === "automation_consult" && !hasAutoSent) {
      // Clean URL by removing query param, redirect to dashboard
      router.replace("/dashboard");
      setHasAutoSent(true);
      
      // Wait a bit for chat to be fully ready, then auto-send
      setTimeout(() => {
        const autoMessage = "Quiero automatizar mi negocio. Inicia el análisis.";
        sendMessage(autoMessage);
      }, 500);
    } else if (action === "software_consult" && !hasAutoSent) {
      // Clean URL by removing query param, redirect to dashboard
      router.replace("/dashboard");
      setHasAutoSent(true);
      
      // Wait a bit for chat to be fully ready, then auto-send
      setTimeout(() => {
        const moduleText = module ? ` sobre el módulo "${module}"` : "";
        const autoMessage = `Me interesa solicitar una demo${moduleText}. ¿Puedes ayudarme?`;
        sendMessage(autoMessage);
      }, 500);
    }
  }, [isOpen, isLoadingHistory, searchParams, hasAutoSent, router, sendMessage]);

  if (!isOpen) return null;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-20 right-6 z-50",
        "w-80 h-96 bg-white shadow-2xl rounded-xl border border-gray-200",
        "flex flex-col",
        "transition-all duration-300",
        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-600 text-white px-4 py-3 rounded-t-xl">
        <h2 className="text-sm font-semibold">B.A.I. Assistant</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-700 rounded transition-colors"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body: Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-2",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                msg.role === "user"
                  ? "bg-blue-600"
                  : "bg-gradient-to-r from-blue-500 to-purple-600"
              )}
            >
              {msg.role === "user" ? (
                <span className="text-white text-xs font-bold">U</span>
              ) : (
                <span className="text-white text-xs font-bold">B</span>
              )}
            </div>
            <div
              className={cn(
                "flex-1 rounded-lg px-3 py-2 max-w-[80%]",
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              )}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-600 italic">Pensando...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer: Input Area */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSend}
            size="sm"
            className="flex-shrink-0"
            disabled={!message.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
