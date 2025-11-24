"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { DatabaseZap, TrendingUp, Star, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { PageContainer, PageItem } from "@/components/ui/PageAnimation";
import { cn } from "@/lib/utils";
import { useChat } from "@/context/ChatContext";
import { useDashboard } from "@/context/DashboardContext";

// Custom Tooltip for dark theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl">
        <p className="text-slate-300 text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DataPage() {
  const { openChat } = useChat();
  const { data: mockData } = useDashboard();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Open chat with bot's initial message for Data Mining protocol
    openChat("¡Entendido! Iniciando protocolo de Data Mining. ¿Qué negocio o idea quieres analizar hoy para tu informe?");
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const getViabilityColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getSaturationColor = (index: number) => {
    if (index >= 70) return "text-rose-400";
    if (index >= 50) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <PageContainer className="w-full space-y-6">
      {/* Header Section */}
      <PageItem>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-emerald-500/20 border border-violet-500/30">
              <DatabaseZap className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                Inteligencia de Mercado
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Análisis en tiempo real de tendencias y patrones de consumo
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generando..." : "Generar Nuevo Informe"}
          </Button>
        </div>
      </PageItem>

      {/* Executive Summary Row */}
      <PageContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Market Viability */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-slate-400">Market Viability</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className={cn("text-5xl font-bold", getViabilityColor(mockData.marketViability))}>
                {mockData.marketViability}
              </span>
              <span className="text-2xl text-slate-500 mb-2">/100</span>
            </div>
            <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  mockData.marketViability >= 70
                    ? "bg-emerald-500"
                    : mockData.marketViability >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                )}
                style={{ width: `${mockData.marketViability}%` }}
              />
            </div>
          </div>
        </PageItem>

        {/* Card 2: Viral Potential */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                <span className="text-sm text-slate-400">Viral Potential</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold text-amber-400">
                {mockData.viralPotential}
              </span>
              <span className="text-2xl text-slate-500 mb-2">/10</span>
            </div>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 h-2 rounded-full",
                    i < Math.round(mockData.viralPotential)
                      ? "bg-amber-500"
                      : "bg-slate-800"
                  )}
                />
              ))}
            </div>
          </div>
        </PageItem>

        {/* Card 3: Saturation Index */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-sm text-slate-400">Saturation Index</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className={cn("text-5xl font-bold", getSaturationColor(mockData.saturationIndex))}>
                {mockData.saturationIndex}%
              </span>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              {mockData.saturationIndex >= 70
                ? "Alta saturación - Diferenciación crítica"
                : mockData.saturationIndex >= 50
                ? "Saturación media - Oportunidad moderada"
                : "Baja saturación - Mercado abierto"}
            </div>
          </div>
        </PageItem>
      </PageContainer>

      {/* Deep Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Search Trends (Wide) */}
        <PageItem className="lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-4">Search Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockData.searchTrends}>
                <defs>
                  <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="searches"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#colorSearches)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PageItem>

        {/* Side Chart: Sentiment Analysis */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-4">Sentiment Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.sentimentAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.sentimentAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PageItem>
      </div>

      {/* Second Row: Platform Dominance & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Dominance Radar */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Dominance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={mockData.platformDominance}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="platform"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#334155" />
                <Radar
                  name="Presence"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </PageItem>

        {/* Demographics Bar Chart */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-4">Demographics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.demographics}>
                <XAxis
                  dataKey="age"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageItem>
      </div>

      {/* Third Row: Peak Hours & Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-4">Peak Hours Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockData.peakHours} layout="vertical">
                <XAxis type="number" stroke="#64748b" style={{ fontSize: "12px" }} />
                <YAxis
                  dataKey="hour"
                  type="category"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="activity" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageItem>

        {/* Additional Metrics */}
        <PageItem>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-4">Additional Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="text-sm text-slate-400">Competition Density</span>
                <span className="text-lg font-semibold text-amber-400">
                  {mockData.competitionDensity}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="text-sm text-slate-400">Price Sensitivity</span>
                <span className="text-lg font-semibold text-violet-400">
                  {mockData.priceSensitivity}
                </span>
              </div>
            </div>
          </div>
        </PageItem>
      </div>

      {/* Strategic Insights - AI Conclusion */}
      <PageItem>
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Strategic Insights</h3>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-6">
            <div className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {mockData.aiConclusion}
            </div>
          </div>
        </div>
      </PageItem>
    </PageContainer>
  );
}
