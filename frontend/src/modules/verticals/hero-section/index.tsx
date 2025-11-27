/**
 * Hero Section Module - LEGO Dual Pattern
 * 
 * Este módulo implementa el patrón "LEGO Dual" que expone dos caras:
 * 
 * 1. CARA A (HeroAdmin): Panel de gestión interna para el dashboard del dueño
 *    - Permite configurar título, imagen de fondo, etc.
 *    - Se muestra en: src/app/(platform)/dashboard
 * 
 * 2. CARA B (HeroPublic): Widget visual para el cliente final
 *    - Banner hero atractivo adaptado al tema de la app
 *    - Se muestra en: src/app/(marketing)/page.tsx
 * 
 * Arquitectura Modular:
 * - Ambos componentes comparten la misma lógica de negocio
 * - Representaciones visuales opuestas (admin vs público)
 * - Colores dinámicos basados en app-registry.ts
 */

import React from 'react';

// ============================================
// CARA A: ADMIN PANEL (Para el Dashboard del Dueño)
// ============================================

/**
 * HeroAdmin Component
 * 
 * Interfaz de gestión interna que permite al dueño configurar
 * el contenido del hero banner. En esta versión MVP es una simulación,
 * pero en producción se conectará con el backend para persistir cambios.
 * 
 * Contexto de uso: Dashboard interno (plataforma privada)
 * 
 * @returns Componente de panel de administración para configurar el hero
 */
export const HeroAdmin = () => {
  return (
    <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
      {/* Header del módulo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <span className="text-2xl" role="img" aria-label="Hero section icon">
            🖼️
          </span>
        </div>
        <div>
          <h3 className="font-bold text-slate-700">Configuración del Hero Banner</h3>
          <p className="text-xs text-slate-500">Módulo activo: hero_section</p>
        </div>
      </div>
      
      {/* Formulario simulado de configuración */}
      <div className="space-y-4">
        {/* Input simulado: Título Principal */}
        <div className="h-10 bg-white border border-slate-200 rounded w-full flex items-center px-3 text-slate-400 text-sm">
          [Simulación: Input para Título Principal]
        </div>
        
        {/* Input simulado: Imagen de Fondo */}
        <div className="h-10 bg-white border border-slate-200 rounded w-full flex items-center px-3 text-slate-400 text-sm">
          [Simulación: Upload de Imagen de Fondo]
        </div>
        
        {/* Botón de guardar simulado */}
        <button 
          className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 transition-colors"
          disabled
          aria-label="Guardar cambios (funcionalidad simulada)"
        >
          Guardar Cambios (Simulado)
        </button>
      </div>
      
      {/* Nota informativa para desarrollo */}
      <p className="mt-4 text-xs text-slate-400 italic">
        💡 En producción, estos cambios se guardarán y afectarán al banner público
      </p>
    </div>
  );
};

// ============================================
// CARA B: PUBLIC WIDGET (Para el Cliente Final)
// ============================================

/**
 * Props para el componente HeroPublic
 */
interface HeroPublicProps {
  /** Nombre de la aplicación (ej: "RestaurantiApp", "InmoAI") */
  appName: string;
  /** Clase de color Tailwind CSS para el fondo (ej: "bg-orange-600", "bg-slate-900") */
  colorClass: string;
}

/**
 * HeroPublic Component
 * 
 * Banner hero público que se muestra en la landing page del cliente.
 * Se adapta dinámicamente al tema de la aplicación usando los colores
 * definidos en app-registry.ts.
 * 
 * Características:
 * - Responsive (adaptable a móvil y desktop)
 * - Alto impacto visual
 * - Colores inyectados dinámicamente
 * - Animaciones suaves
 * 
 * Contexto de uso: Página pública (marketing/landing)
 * 
 * @param props - Propiedades del componente
 * @param props.appName - Nombre de la aplicación a mostrar
 * @param props.colorClass - Clase de color Tailwind para el fondo
 * @returns Componente de banner hero público
 */
export const HeroPublic = ({ appName, colorClass }: HeroPublicProps) => {
  return (
    <section 
      className={`w-full py-24 px-4 text-white text-center transition-colors duration-500 ${colorClass}`}
      role="banner"
      aria-label={`Hero section de ${appName}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Badge superior */}
        <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium border border-white/30">
          Bienvenido a la experiencia
        </span>
        
        {/* Título principal */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-sm">
          {appName}
        </h1>
        
        {/* Subtítulo */}
        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto font-light">
          La solución digital adaptada a tu sector.
        </p>
        
        {/* CTA Buttons */}
        <div className="pt-8 flex gap-4 justify-center flex-wrap">
          <button 
            className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full shadow-lg hover:bg-opacity-90 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Empezar ahora"
          >
            Empezar Ahora
          </button>
          <button 
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Saber más"
          >
            Saber Más
          </button>
        </div>
      </div>
    </section>
  );
};

