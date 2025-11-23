import { DatabaseZap } from "lucide-react";

export default function DataMiningPage() {
  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-slate-900">
            <DatabaseZap className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Intelligence & Data Mining</h1>
            <p className="text-sm text-gray-600">Market intelligence and predictive analysis</p>
          </div>
        </div>

        {/* Content - Dark Terminal Style */}
        <div className="space-y-6">
          {/* Latest Reports */}
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
            </div>
          </div>

          {/* Live Search Feed */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-green-400">Live Search Feed</h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="rounded border border-slate-700 bg-slate-800 p-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-green-400">[INFO]</span>
                  <span>Query: "AI market trends" | Results: 12 | Timestamp: 14:35:22</span>
                </div>
              </div>
              <div className="rounded border border-slate-700 bg-slate-800 p-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-green-400">[INFO]</span>
                  <span>Query: "competitor analysis" | Results: 8 | Timestamp: 14:30:15</span>
                </div>
              </div>
              <div className="rounded border border-slate-700 bg-slate-800 p-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-blue-400">[PENDING]</span>
                  <span>Query: "industry insights" | Status: Queued...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal-style Info Box */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-xs text-green-400">$</span>
              <span className="font-mono text-sm text-slate-300">bai-data-mining --status</span>
            </div>
            <div className="mt-4 space-y-1 font-mono text-xs text-slate-400">
              <div>System: ONLINE</div>
              <div>API: Brave Search (Connected)</div>
              <div>Last Sync: 2024-01-15 14:35:22</div>
              <div>Total Queries Today: 47</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

