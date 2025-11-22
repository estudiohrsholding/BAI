"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getHealthCheckUrl } from "@/lib/api";

export function SystemStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(getHealthCheckUrl());
        if (response.ok) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        setIsOnline(false);
      }
    };

    // Check immediately on mount
    checkStatus();

    // Poll every 10 seconds to keep status updated
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 border-t border-slate-800 px-4 py-3">
      <span className="text-xs font-medium text-slate-400">System Status:</span>
      <div
        className={cn(
          "h-3 w-3 rounded-full shadow-sm transition-shadow",
          isOnline
            ? "bg-green-500 shadow-green-500/50"
            : "bg-red-500 shadow-red-500/50"
        )}
        aria-label={isOnline ? "Online" : "Offline"}
      />
    </div>
  );
}
