/**
 * App Registry - Torre de Control de Aplicaciones Verticales
 * 
 * Este archivo actúa como el "Cerebro de Configuración" central que define
 * la identidad de cada aplicación vertical. Su función principal es desacoplar
 * el código del contenido: el Frontend lee este archivo para saber qué colores
 * usar, qué módulos "Lego" inyectar y qué comportamiento aplicar.
 * 
 * Arquitectura LEGO DUAL:
 * - Cada aplicación vertical tiene su propio tema y conjunto de módulos
 * - Los módulos pueden ser inyectados dinámicamente según la app activa
 * - El sistema lee NEXT_PUBLIC_APP_ID para determinar qué app mostrar
 */

/**
 * IDs de módulos disponibles en el sistema
 * Cada módulo puede tener dos caras: Admin Panel y Public Widget
 */
export type ModuleId = 
  | 'hero_section'      // Sección hero principal (adaptable por app)
  | 'booking_system'    // Sistema de reservas (restaurantes)
  | 'menu_grid'         // Grid de menú (restaurantes)
  | 'property_grid';    // Grid de propiedades (inmobiliarias)

/**
 * Configuración de tema para una aplicación vertical
 * Define los colores y estilos Tailwind CSS que debe usar la app
 */
export interface AppTheme {
  /** Color primario (botones principales, headers) */
  primary: string;
  /** Color secundario (fondos, acentos suaves) */
  secondary: string;
  /** Color de acento opcional (highlights, badges) */
  accent?: string;
}

/**
 * Configuración completa de una aplicación vertical
 * Define la identidad, apariencia y módulos activos de una app
 */
export interface AppConfig {
  /** ID único de la aplicación (debe coincidir con la clave en APP_CATALOG) */
  id: string;
  /** Nombre legible de la aplicación */
  name: string;
  /** Configuración de tema (colores Tailwind CSS) */
  theme: AppTheme;
  /** Lista de módulos "Lego" que deben ser inyectados en esta app */
  modules: ModuleId[];
}

/**
 * Catálogo de aplicaciones verticales disponibles
 * 
 * Cada aplicación representa un "vertical" diferente (restaurante, inmobiliaria, etc.)
 * y tiene su propia configuración de tema y módulos activos.
 */
export const APP_CATALOG: Record<string, AppConfig> = {
  /**
   * RestaurantiApp - Aplicación para restaurantes
   * Tema naranja/comida para transmitir calidez y apetito
   */
  restaurantiapp: {
    id: 'restaurantiapp',
    name: 'RestaurantiApp',
    theme: {
      primary: 'bg-orange-600',
      secondary: 'bg-orange-50',
      accent: 'text-orange-700',
    },
    modules: ['hero_section', 'booking_system'],
  },

  /**
   * InmoAI - Aplicación para inmobiliarias
   * Tema slate/corporativo para transmitir profesionalidad y confianza
   */
  inmoai: {
    id: 'inmoai',
    name: 'InmoAI',
    theme: {
      primary: 'bg-slate-900',
      secondary: 'bg-slate-50',
      accent: 'text-slate-700',
    },
    modules: ['hero_section'],
  },
};

/**
 * Obtiene la configuración de la aplicación actual
 * 
 * Lee la variable de entorno NEXT_PUBLIC_APP_ID para determinar qué app debe mostrarse.
 * Si no está definida o el ID no existe en el catálogo, usa 'restaurantiapp' como fallback.
 * 
 * @returns La configuración de la aplicación activa
 * 
 * @example
 * ```tsx
 * const app = getCurrentApp();
 * console.log(app.name); // "RestaurantiApp"
 * console.log(app.theme.primary); // "bg-orange-600"
 * ```
 */
export function getCurrentApp(): AppConfig {
  const currentAppId = process.env.NEXT_PUBLIC_APP_ID || 'restaurantiapp';
  
  // Verificar que el ID existe en el catálogo
  const appConfig = APP_CATALOG[currentAppId];
  
  // Si no existe, usar restaurantiapp como fallback seguro
  if (!appConfig) {
    console.warn(
      `[App Registry] App ID "${currentAppId}" no encontrada en el catálogo. ` +
      `Usando fallback: restaurantiapp`
    );
    return APP_CATALOG['restaurantiapp'];
  }
  
  return appConfig;
}

/**
 * Verifica si un módulo está activo para la aplicación actual
 * 
 * Útil para renderizado condicional de componentes basado en la configuración.
 * 
 * @param moduleId - El ID del módulo a verificar
 * @returns true si el módulo está en la lista de módulos activos de la app actual
 * 
 * @example
 * ```tsx
 * if (isModuleActive('booking_system')) {
 *   return <BookingWidget />;
 * }
 * ```
 */
export function isModuleActive(moduleId: ModuleId): boolean {
  const currentApp = getCurrentApp();
  return currentApp.modules.includes(moduleId);
}

/**
 * Obtiene todos los módulos activos para la aplicación actual
 * 
 * @returns Array de IDs de módulos que deben ser renderizados
 */
export function getActiveModules(): ModuleId[] {
  const currentApp = getCurrentApp();
  return currentApp.modules;
}

