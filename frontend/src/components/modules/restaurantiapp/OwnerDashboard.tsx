"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Users,
  Clock,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TableStatus = "libre" | "ocupada" | "reservada";

interface Table {
  id: string;
  number: number;
  status: TableStatus;
  capacity: number;
  reservation?: {
    name: string;
    time: string;
  };
}

export function RestaurantiappOwnerDashboard() {
  const [tables] = useState<Table[]>([
    { id: "1", number: 1, status: "ocupada", capacity: 4, reservation: { name: "Mesa 1", time: "20:00" } },
    { id: "2", number: 2, status: "libre", capacity: 2 },
    { id: "3", number: 3, status: "reservada", capacity: 6, reservation: { name: "García", time: "20:30" } },
    { id: "4", number: 4, status: "ocupada", capacity: 4, reservation: { name: "Mesa 4", time: "19:45" } },
    { id: "5", number: 5, status: "libre", capacity: 2 },
    { id: "6", number: 6, status: "ocupada", capacity: 8, reservation: { name: "Mesa 6", time: "20:15" } },
    { id: "7", number: 7, status: "reservada", capacity: 4, reservation: { name: "López", time: "21:00" } },
    { id: "8", number: 8, status: "libre", capacity: 2 },
    { id: "9", number: 9, status: "ocupada", capacity: 4, reservation: { name: "Mesa 9", time: "19:30" } },
    { id: "10", number: 10, status: "libre", capacity: 6 },
    { id: "11", number: 11, status: "reservada", capacity: 2, reservation: { name: "Martínez", time: "20:45" } },
    { id: "12", number: 12, status: "ocupada", capacity: 4, reservation: { name: "Mesa 12", time: "20:00" } },
  ]);

  const occupiedTables = tables.filter((t) => t.status === "ocupada").length;
  const reservedTables = tables.filter((t) => t.status === "reservada").length;
  const freeTables = tables.filter((t) => t.status === "libre").length;

  const getTableStatusColor = (status: TableStatus) => {
    switch (status) {
      case "libre":
        return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
      case "ocupada":
        return "bg-orange-500/20 border-orange-500/40 text-orange-400";
      case "reservada":
        return "bg-amber-500/20 border-amber-500/40 text-amber-400";
    }
  };

  const getTableStatusIcon = (status: TableStatus) => {
    switch (status) {
      case "libre":
        return CheckCircle2;
      case "ocupada":
        return UtensilsCrossed;
      case "reservada":
        return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950/20 to-slate-950 text-slate-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
            <UtensilsCrossed className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Sala y Cocina</h1>
            <p className="text-sm text-orange-400/80">Panel de Control - Restaurante</p>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* KPI 1: Mesas Ocupadas */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 shadow-lg shadow-orange-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <MapPin className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-xs text-orange-400/60 uppercase tracking-wider font-medium">
              Ahora
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-white">{occupiedTables}</div>
            <div className="text-sm text-slate-400">Mesas Ocupadas</div>
            <div className="flex items-center gap-1 text-xs text-orange-400">
              <TrendingUp className="h-3 w-3" />
              <span>de {tables.length} totales</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pedidos Pendientes */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 shadow-lg shadow-orange-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-xs text-orange-400/60 uppercase tracking-wider font-medium">
              Cocina
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-white">12</div>
            <div className="text-sm text-slate-400">Pedidos Pendientes</div>
            <div className="flex items-center gap-1 text-xs text-orange-400">
              <AlertCircle className="h-3 w-3" />
              <span>3 urgentes</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Ticket Medio */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 shadow-lg shadow-orange-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-xs text-orange-400/60 uppercase tracking-wider font-medium">
              Hoy
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-white">€42.50</div>
            <div className="text-sm text-slate-400">Ticket Medio</div>
            <div className="flex items-center gap-1 text-xs text-orange-400">
              <TrendingUp className="h-3 w-3" />
              <span>+8% vs ayer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa de Mesas */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 shadow-lg shadow-orange-500/10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Estado de Mesas</h2>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500"></div>
              <span className="text-slate-400">Libre ({freeTables})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500/40 border border-orange-500"></div>
              <span className="text-slate-400">Ocupada ({occupiedTables})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500"></div>
              <span className="text-slate-400">Reservada ({reservedTables})</span>
            </div>
          </div>
        </div>

        {/* Grid de Mesas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map((table) => {
            const StatusIcon = getTableStatusIcon(table.status);
            return (
              <div
                key={table.id}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105",
                  getTableStatusColor(table.status)
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <StatusIcon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="text-lg font-bold">Mesa {table.number}</div>
                    <div className="text-xs opacity-80">{table.capacity} personas</div>
                  </div>
                  {table.reservation && (
                    <div className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-1 border border-current">
                      <Clock className="h-3 w-3" />
                    </div>
                  )}
                </div>
                {table.reservation && (
                  <div className="mt-2 pt-2 border-t border-current/20 text-center">
                    <div className="text-xs font-medium">{table.reservation.name}</div>
                    <div className="text-xs opacity-70">{table.reservation.time}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comandas en Cocina */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 shadow-lg shadow-orange-500/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Comandas en Cocina</h2>
          </div>
          <span className="text-xs text-orange-400/60 uppercase tracking-wider font-medium">
            Tiempo real
          </span>
        </div>

        <div className="space-y-3">
          {[
            { id: "1", table: 6, items: "2x Paella, 1x Ensalada", time: "12 min", urgent: true },
            { id: "2", table: 1, items: "1x Risotto, 2x Pasta", time: "8 min", urgent: false },
            { id: "3", table: 4, items: "3x Pizza, 2x Bebidas", time: "15 min", urgent: true },
            { id: "4", table: 9, items: "1x Entrante, 2x Principal", time: "5 min", urgent: false },
            { id: "5", table: 12, items: "4x Menú del día", time: "18 min", urgent: true },
          ].map((order) => (
            <div
              key={order.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                order.urgent
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-slate-800/50 border-orange-500/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg",
                    order.urgent
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                      : "bg-slate-700 text-slate-300"
                  )}
                >
                  {order.table}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Mesa {order.table}</div>
                  <div className="text-xs text-slate-400">{order.items}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-orange-400">{order.time}</div>
                  <div className="text-xs text-slate-500">Tiempo</div>
                </div>
                {order.urgent && (
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

