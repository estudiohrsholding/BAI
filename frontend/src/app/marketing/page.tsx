/**
 * Home Page - El Ensamblador (Renderizador Inteligente)
 * 
 * Esta página actúa como el "Ensamblador" que conecta el "Cerebro" (Registry)
 * con los "Legos" (Módulos Verticales). En lugar de tener contenido estático,
 * lee la configuración de la app activa y decide dinámicamente qué componentes
 * pintar y con qué estilos.
 * 
 * Flujo de lógica:
 * 1. Lee la configuración de la app activa usando getCurrentApp()
 * 2. Extrae appName, theme, y modules de la configuración
 * 3. Verifica qué módulos están activos
 * 4. Renderiza cada módulo LEGO según la configuración
 * 5. Inyecta los colores del tema dinámicamente
 * 
 * Arquitectura LEGO DUAL:
 * - Esta página renderiza la "Cara B" (Pública) de los módulos
 * - La "Cara A" (Admin) se renderiza en el dashboard
 * 
 * Ubicación: src/app/(marketing)/page.tsx
 * Ruta pública: / (raíz)
 */

import { getCurrentApp } from '@/config/app-registry';
import { HeroPublic } from '@/modules/verticals/hero-section';

/**
 * HomePage Component
 * 
 * Renderizador inteligente que ensambla dinámicamente los módulos LEGO
 * según la configuración de la aplicación activa.
 * 
 * @returns Página principal con módulos renderizados dinámicamente
 */
export default function HomePage() {
  // 1. LEER EL CEREBRO (Configuración de la app activa)
  const appConfig = getCurrentApp();

  return (
    <main className="min-h-screen flex flex-col items-center w-full">
      {/* --- ZONA DE MONTAJE DE LEGOS (Cara Pública) --- */}
      
      {/* Lego 1: Hero Section */}
      {/* Si la configuración dice que lleva Hero, lo pintamos con sus colores */}
      {appConfig.modules.includes('hero_section') && (
        <HeroPublic 
          appName={appConfig.name} 
          colorClass={appConfig.theme.primary} 
        />
      )}
      
      {/* Aquí irían futuros Legos: BookingWidget, MenuGrid, PropertyGrid, etc. */}
      {/* 
        {appConfig.modules.includes('booking_system') && (
          <BookingWidget appName={appConfig.name} theme={appConfig.theme} />
        )}
        
        {appConfig.modules.includes('menu_grid') && (
          <MenuGrid appName={appConfig.name} theme={appConfig.theme} />
        )}
        
        {appConfig.modules.includes('property_grid') && (
          <PropertyGrid appName={appConfig.name} theme={appConfig.theme} />
        )}
      */}
      
      {/* --- DEBUGGING AREA (Solo para desarrollo) --- */}
      <div className="fixed bottom-4 right-4 p-4 bg-slate-100 border border-slate-300 rounded-lg shadow-xl text-xs font-mono opacity-80 hover:opacity-100 transition-opacity z-50">
        <p className="font-bold text-slate-700 mb-1">🔧 B.A.I. Debugger</p>
        <div className="space-y-1 text-slate-600">
          <p>
            App ID: <span className="text-blue-600 font-bold">{appConfig.id}</span>
          </p>
          <p>
            App Name: <span className="text-purple-600 font-bold">{appConfig.name}</span>
          </p>
          <p>
            Theme: <span className={`inline-block w-3 h-3 rounded-full ml-1 ${appConfig.theme.primary}`}></span>
            <span className="ml-2 text-slate-500">{appConfig.theme.primary}</span>
          </p>
          <p className="mt-2">Módulos Activos:</p>
          <ul className="list-disc list-inside pl-1">
            {appConfig.modules.length > 0 ? (
              appConfig.modules.map(m => (
                <li key={m} className="text-emerald-600">
                  {m}
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">Ninguno</li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
