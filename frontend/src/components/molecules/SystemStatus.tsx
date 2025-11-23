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
    <div className="flex items-center gap-2 px-0 py-2">
      <span className="text-xs font-medium text-slate-400">System Status:</span>
      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full shadow-sm transition-shadow",
          isOnline
            ? "bg-emerald-400 shadow-emerald-400/50"
            : "bg-rose-500 shadow-rose-500/50"
        )}
        aria-label={isOnline ? "Online" : "Offline"}
      />
    </div>
  );
}
