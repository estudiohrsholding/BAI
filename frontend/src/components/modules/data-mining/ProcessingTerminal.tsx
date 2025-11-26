"use client";

import { useEffect, useState } from "react";
import { Terminal, CheckCircle2, Loader2 } from "lucide-react";

interface ProcessingTerminalProps {
  onComplete: () => void;
}

export function ProcessingTerminal({ onComplete }: ProcessingTerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);

  const steps = [
    "> Iniciando conexión segura con Brave Search API...",
    "> Identificando clústers de tendencias...",
    "> Analizando 45,000 menciones en Social Media...",
    "> Cruzando datos con Google Trends (Region: ES)...",
    "> Calculando índice de saturación de mercado...",
    "> Generando informe estratégico preliminar..."
  ];

  useEffect(() => {
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000); // Pequeña pausa final antes de cerrar
      }
    }, 800); // Velocidad de los logs

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="space-y-3">
      {logs.map((log, index) => (
        <div key={index} className="flex items-center gap-3 text-green-400/90 text-sm animate-in slide-in-from-left-2 fade-in duration-300">
          <span className="opacity-50">{`[${new Date().toLocaleTimeString()}]`}</span>
          <span>{log}</span>
        </div>
      ))}
      
      {logs.length < steps.length && (
        <div className="flex items-center gap-2 text-green-500/50 text-sm animate-pulse mt-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Procesando...</span>
        </div>
      )}
      {logs.length === steps.length && (
        <div className="flex items-center gap-2 text-green-400 font-bold mt-4 pt-4 border-t border-green-900/50">
          <CheckCircle2 className="h-5 w-5" />
          <span>ANÁLISIS COMPLETADO. REVELANDO DATOS.</span>
        </div>
      )}
    </div>
  );
}
