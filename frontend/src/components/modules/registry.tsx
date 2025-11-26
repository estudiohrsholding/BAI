"use client";

import { ComponentType } from "react";
import { CannabiappOwnerDashboard } from "./CannabiApp/OwnerDashboard";
import { RestaurantiappOwnerDashboard } from "./restaurantiapp/OwnerDashboard";

/**
 * Registry Pattern: Mapea appId -> Componente Dashboard específico
 * 
 * Este archivo actúa como el "Portero" que decide qué componente
 * mostrar según el ID de la aplicación.
 * 
 * Para agregar una nueva app:
 * 1. Crea el componente en src/components/modules/[appId]/OwnerDashboard.tsx
 * 2. Importa el componente aquí
 * 3. Agrégalo al registry
 */
export type DashboardComponent = ComponentType;

export interface AppDashboardRegistry {
  [appId: string]: DashboardComponent | undefined;
}

/**
 * Registry de Dashboards por App ID
 * 
 * Si una app no tiene dashboard específico, retorna undefined
 * y el sistema puede mostrar un dashboard genérico o 404.
 */
export const APP_DASHBOARD_REGISTRY: AppDashboardRegistry = {
  cannabiapp: CannabiappOwnerDashboard,
  restaurantiapp: RestaurantiappOwnerDashboard,
  // stylebook: StylebookOwnerDashboard,  // TODO: Implementar
  // retailflow: RetailflowOwnerDashboard, // TODO: Implementar
  // bizcore: BizcoreOwnerDashboard,       // TODO: Implementar
};

/**
 * Obtiene el componente Dashboard para un appId dado
 * 
 * @param appId - ID de la aplicación (ej: 'cannabiapp')
 * @returns Componente Dashboard o undefined si no existe
 */
export function getDashboardComponent(appId: string): DashboardComponent | undefined {
  return APP_DASHBOARD_REGISTRY[appId];
}

/**
 * Verifica si existe un dashboard específico para un appId
 * 
 * @param appId - ID de la aplicación
 * @returns true si existe dashboard específico, false en caso contrario
 */
export function hasDashboardComponent(appId: string): boolean {
  return appId in APP_DASHBOARD_REGISTRY && APP_DASHBOARD_REGISTRY[appId] !== undefined;
}

