"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { DatabaseZap } from "lucide-react";
import { getDataLogsUrl } from "@/lib/api";

interface SearchLog {
  id: number;
  query: string;
  summary: string;
  timestamp: string;
  status: string;
}

export default function DataPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<SearchLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = Cookies.get("bai_token");
        
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(getDataLogsUrl(), {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load logs");
        }

        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Error loading search logs:", error);
      }
    };

    fetchLogs();
  }, [router]);

  return (
    <div className="w-full h-full space-y-6">
        {/* Header - Dark theme style */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900">
            <DatabaseZap className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Intelligence & Data Mining</h1>
            <p className="text-sm text-slate-400">Market intelligence and predictive analysis</p>
          </div>
        </div>

        {/* Section 1: Latest Reports - Static placeholder cards (dark slate cards) */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-green-400">Latest Reports</h2>
          <div className="space-y-3">
            <div className="rounded border border-slate-700 bg-slate-800 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-mono text-sm font-medium text-green-400">
                  market_analysis_2024.json
                </h3>
                <span className="rounded bg-green-900/30 px-2 py-1 text-xs font-mono text-green-400">
                  COMPLETE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generated: 2024-01-15 14:32:18 | Sources: 47 | Status: Ready
              </p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-800 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-mono text-sm font-medium text-green-400">
                  competitor_intel_q1.json
                </h3>
                <span className="rounded bg-yellow-900/30 px-2 py-1 text-xs font-mono text-yellow-400">
                  PROCESSING
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generated: 2024-01-15 14:28:45 | Sources: 23 | Status: Analyzing...
              </p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-800 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-mono text-sm font-medium text-green-400">
                  industry_trends_report.json
                </h3>
                <span className="rounded bg-green-900/30 px-2 py-1 text-xs font-mono text-green-400">
                  COMPLETE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generated: 2024-01-15 14:15:33 | Sources: 62 | Status: Ready
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Live Feed - Map through logs state, display like terminal log */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-green-400">Live Search Feed</h2>
          {logs.length === 0 ? (
            <div className="rounded border border-slate-700 bg-slate-800 p-3">
              <div className="flex items-center gap-2 font-mono text-sm text-slate-400">
                <span className="text-yellow-400">[INFO]</span>
                <span>No active intelligence operations yet.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {logs.map((log) => (
                <div key={log.id} className="rounded border border-slate-700 bg-slate-800 p-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className={log.status === "completed" ? "text-green-400" : "text-red-400"}>
                      [INFO]
                    </span>
                    <span>
                      Query: "{log.query}" | Time: {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Fake terminal input line */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-green-400">$</span>
            <span className="font-mono text-sm text-slate-300">bai-data-mining --status</span>
          </div>
        </div>
    </div>
  );
}