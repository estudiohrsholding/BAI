"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface DashboardData {
  marketViability: number;
  competitionDensity: string;
  searchTrends: Array<{ month: string; searches: number }>;
  sentimentAnalysis: Array<{ name: string; value: number; color: string }>;
  demographics: Array<{ age: string; count: number }>;
  peakHours: Array<{ hour: string; activity: number }>;
  platformDominance: Array<{ platform: string; value: number }>;
  priceSensitivity: string;
  saturationIndex: number;
  viralPotential: number;
  aiConclusion: string;
}

interface DashboardContextType {
  data: DashboardData;
  loadScenario: (scenario: "default" | "hair_salon") => void;
  currentScenario: "default" | "hair_salon";
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Default Data: Coffee Shop in Madrid
const defaultData: DashboardData = {
  marketViability: 78,
  competitionDensity: "Med",
  searchTrends: [
    { month: "Ene", searches: 1200 },
    { month: "Feb", searches: 1450 },
    { month: "Mar", searches: 1680 },
    { month: "Abr", searches: 1920 },
    { month: "May", searches: 2100 },
    { month: "Jun", searches: 2350 },
  ],
  sentimentAnalysis: [
    { name: "Positivo", value: 65, color: "#10b981" },
    { name: "Neutral", value: 25, color: "#8b5cf6" },
    { name: "Negativo", value: 10, color: "#f59e0b" },
  ],
  demographics: [
    { age: "18-24", count: 1200 },
    { age: "25-34", count: 2800 },
    { age: "35-44", count: 1900 },
    { age: "45-54", count: 800 },
    { age: "55+", count: 300 },
  ],
  peakHours: [
    { hour: "08:00", activity: 45 },
    { hour: "10:00", activity: 78 },
    { hour: "12:00", activity: 92 },
    { hour: "14:00", activity: 65 },
    { hour: "16:00", activity: 88 },
    { hour: "18:00", activity: 95 },
    { hour: "20:00", activity: 72 },
  ],
  platformDominance: [
    { platform: "Instagram", value: 85 },
    { platform: "TikTok", value: 45 },
    { platform: "Twitter", value: 30 },
    { platform: "Facebook", value: 60 },
    { platform: "LinkedIn", value: 20 },
  ],
  priceSensitivity: "Med",
  saturationIndex: 68,
  viralPotential: 7.2,
  aiConclusion: `Análisis Estratégico: El mercado de cafeterías en Madrid muestra una viabilidad del 78%, indicando una oportunidad sólida pero competitiva. La densidad de competencia es media, con espacio para diferenciación. Las tendencias de búsqueda muestran un crecimiento constante del 15% mensual, sugiriendo demanda creciente.

El sentimiento general es predominantemente positivo (65%), lo que indica buena percepción del concepto. La demografía objetivo (25-34 años) representa el 40% del mercado, alineándose con el perfil de consumidores de café premium.

Las horas pico (12:00 y 18:00) coinciden con pausas laborales, sugiriendo un modelo de negocio orientado a profesionales. Instagram domina con 85% de presencia, siendo la plataforma clave para marketing.

El índice de saturación del 68% indica que el mercado está moderadamente saturado, pero aún hay espacio para conceptos innovadores. El potencial viral de 7.2/10 es prometedor, especialmente con contenido visual en Instagram.

Recomendación: Posicionarse como "Third Place" premium con WiFi rápido, ambiente de trabajo y productos de especialidad. Enfoque en Instagram para marketing y horarios extendidos para capturar picos de demanda.`,
};

// Hair Salon Data: Peluquería en Torrevieja
const hairSalonData: DashboardData = {
  marketViability: 92,
  competitionDensity: "Baja",
  searchTrends: [
    { month: "Ene", searches: 850 },
    { month: "Feb", searches: 920 },
    { month: "Mar", searches: 1100 },
    { month: "Abr", searches: 1350 },
    { month: "May", searches: 1500 },
    { month: "Jun", searches: 1800 },
  ],
  sentimentAnalysis: [
    { name: "Positivo", value: 85, color: "#10b981" },
    { name: "Neutral", value: 12, color: "#8b5cf6" },
    { name: "Negativo", value: 3, color: "#f59e0b" },
  ],
  demographics: [
    { age: "18-24", count: 200 },
    { age: "25-34", count: 400 },
    { age: "35-44", count: 600 },
    { age: "45-54", count: 800 },
    { age: "55+", count: 3200 },
  ],
  peakHours: [
    { hour: "09:00", activity: 65 },
    { hour: "11:00", activity: 88 },
    { hour: "13:00", activity: 72 },
    { hour: "15:00", activity: 95 },
    { hour: "17:00", activity: 82 },
    { hour: "19:00", activity: 68 },
  ],
  platformDominance: [
    { platform: "Instagram", value: 45 },
    { platform: "TikTok", value: 15 },
    { platform: "Twitter", value: 10 },
    { platform: "Facebook", value: 85 },
    { platform: "LinkedIn", value: 5 },
  ],
  priceSensitivity: "Baja",
  saturationIndex: 42,
  viralPotential: 3.5,
  aiConclusion: `Análisis Estratégico: Peluquería en Torrevieja - Alta oportunidad en nicho senior. Torrevieja presenta saturación baja para servicios geriátricos especializados. Rentabilidad proyectada: Alta.

El mercado muestra una viabilidad del 92%, indicando una oportunidad excepcional. La densidad de competencia es baja, especialmente en servicios especializados para personas mayores. Las tendencias de búsqueda muestran estacionalidad clara, con picos en primavera y verano (coincidiendo con la temporada turística).

El sentimiento es extremadamente positivo (85%), reflejando alta lealtad y satisfacción del cliente senior. La demografía dominante (55+ años) representa el 64% del mercado, un nicho claramente definido y con poder adquisitivo estable.

Las horas pico (15:00 y 11:00) reflejan patrones de vida de personas mayores, evitando horas tempranas. Facebook domina con 85% de presencia, siendo la plataforma clave para este segmento demográfico.

El índice de saturación del 42% indica un mercado abierto con espacio significativo para nuevos conceptos. El potencial viral es bajo (3.5/10), lo cual es esperado y positivo para este tipo de negocio local y estable.

Recomendación: Posicionarse como "Salón Senior Premium" con servicios especializados (tintes, permanentes, cortes clásicos), horarios adaptados, accesibilidad física y marketing en Facebook. Enfoque en lealtad y referidos más que en viralidad.`,
};

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [currentScenario, setCurrentScenario] = useState<"default" | "hair_salon">("default");

  const loadScenario = (scenario: "default" | "hair_salon") => {
    if (scenario === "hair_salon") {
      setData(hairSalonData);
      setCurrentScenario("hair_salon");
    } else {
      setData(defaultData);
      setCurrentScenario("default");
    }
  };

  return (
    <DashboardContext.Provider value={{ data, loadScenario, currentScenario }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

