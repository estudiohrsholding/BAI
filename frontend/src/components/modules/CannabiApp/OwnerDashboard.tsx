"use client";

import { useState } from "react";
import {
  Leaf,
  Users,
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Withdrawal {
  id: string;
  member: string;
  variety: string;
  quantity: number;
  price: number;
  time: string;
}

export function CannabiappOwnerDashboard() {
  const [withdrawals] = useState<Withdrawal[]>([
    {
      id: "1",
      member: "Juan Pérez",
      variety: "OG Kush",
      quantity: 3.5,
      price: 45.0,
      time: "14:32",
    },
    {
      id: "2",
      member: "María García",
      variety: "Blue Dream",
      quantity: 5.0,
      price: 60.0,
      time: "14:15",
    },
    {
      id: "3",
      member: "Carlos López",
      variety: "White Widow",
      quantity: 2.0,
      price: 30.0,
      time: "13:58",
    },
    {
      id: "4",
      member: "Ana Martínez",
      variety: "Girl Scout Cookies",
      quantity: 7.0,
      price: 85.0,
      time: "13:42",
    },
    {
      id: "5",
      member: "Luis Rodríguez",
      variety: "OG Kush",
      quantity: 4.0,
      price: 50.0,
      time: "13:25",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 text-slate-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <Leaf className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Dispensario CSC</h1>
            <p className="text-sm text-emerald-400/80">Panel de Control - Club Social</p>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* KPI 1: Socios Activos */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400/60 uppercase tracking-wider font-medium">
              Hoy
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-white">47</div>
            <div className="text-sm text-slate-400">Socios Activos</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+12% vs ayer</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Gramos Dispensados */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Package className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400/60 uppercase tracking-wider font-medium">
              Hoy
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-white">342.5</div>
            <div className="text-sm text-slate-400">Gramos Dispensados</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+8% vs ayer</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Caja Total */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400/60 uppercase tracking-wider font-medium">
              Hoy
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-white">€4,220</div>
            <div className="text-sm text-slate-400">Caja Total</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+15% vs ayer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock de Variedades (Mini KPI) */}
      <div className="mb-8">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Stock de Variedades</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "OG Kush", stock: 125.5, unit: "g" },
              { name: "Blue Dream", stock: 89.0, unit: "g" },
              { name: "White Widow", stock: 67.5, unit: "g" },
              { name: "GSC", stock: 142.0, unit: "g" },
            ].map((variety) => (
              <div
                key={variety.name}
                className="bg-slate-800/50 rounded-lg p-3 border border-emerald-500/10"
              >
                <div className="text-xs text-slate-400 mb-1">{variety.name}</div>
                <div className="text-xl font-bold text-emerald-400">
                  {variety.stock}
                  <span className="text-sm text-slate-500 ml-1">{variety.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Últimas Retiradas */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-500/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Últimas Retiradas</h2>
          </div>
          <span className="text-xs text-emerald-400/60 uppercase tracking-wider font-medium">
            En tiempo real
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-500/20">
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
                  Socio
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
                  Variedad
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
                  Precio
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-emerald-400/80 uppercase tracking-wider">
                  Hora
                </th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr
                  key={withdrawal.id}
                  className="border-b border-slate-800/50 hover:bg-emerald-500/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-white">{withdrawal.member}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-300">{withdrawal.variety}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-medium text-emerald-400">
                      {withdrawal.quantity}g
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-medium text-white">
                      €{withdrawal.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{withdrawal.time}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer de la tabla */}
        <div className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Mostrando {withdrawals.length} retiradas recientes
          </div>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
            Ver todas →
          </button>
        </div>
      </div>
    </div>
  );
}

