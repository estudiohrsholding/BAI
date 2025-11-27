"use client";

import { useEffect, useState } from "react";
import { apiPublic } from "@/lib/api-client";

export function SystemStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Usar cliente API público (sin autenticación)
        await apiPublic("/health", { throwOnError: false });
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    // Check immediately on mount
    checkStatus();

    // Poll every 30 seconds to keep status updated
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-900/50">
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          isOnline
            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            : "bg-red-500 animate-pulse"
        }`}
      />
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-400">System Status</span>
        <span
          className={`text-[10px] font-bold uppercase ${
            isOnline ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>
      </div>
    </div>
  );
}
