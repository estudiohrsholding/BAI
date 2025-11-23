"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CreditCard,
  Image,
  MessageSquare,
  QrCode,
  AppWindow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";

type ModuleCategory = "Management" | "Growth" | "UI";
type FilterCategory = "Todos" | "Gestión" | "Ventas";

interface Module {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  icon: React.ComponentType<{ className?: string }>;
}

const MODULES: Module[] = [
  {
    id: "appointments",
    name: "Sistema de Citas",
    description: "Calendario interactivo con recordatorios WhatsApp.",
    category: "Management",
    icon: Calendar,
  },
  {
    id: "payments",
    name: "Pasarela de Pagos",
    description: "Cobros con tarjeta (Stripe) integrados.",
    category: "Management",
    icon: CreditCard,
  },
  {
    id: "gallery",
    name: "Galería Inmersiva",
    description: "Showcase de productos con efecto Parallax.",
    category: "UI",
    icon: Image,
  },
  {
    id: "sales-chatbot",
    name: "Chatbot Ventas",
    description: "Asistente IA entrenado con tus datos.",
    category: "Growth",
    icon: MessageSquare,
  },
  {
    id: "loyalty",
    name: "Fidelización QR",
    description: "Sistema de puntos y escaneo para clientes.",
    category: "Growth",
    icon: QrCode,
  },
];

const CATEGORY_MAP: Record<ModuleCategory, FilterCategory> = {
  Management: "Gestión",
  Growth: "Ventas",
  UI: "Gestión", // UI modules can be shown under "Gestión" filter
};

export default function SoftwarePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("Todos");

  const handleRequestDemo = (moduleName: string) => {
    // Navigate to dashboard with software consultation action
    router.push(`/dashboard?action=software_consult&module=${encodeURIComponent(moduleName)}`);
  };

  const getFilteredModules = () => {
    if (activeFilter === "Todos") {
      return MODULES;
    }
    return MODULES.filter((module) => CATEGORY_MAP[module.category] === activeFilter);
  };

  const filteredModules = getFilteredModules();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Catálogo de Módulos</h1>
        <p className="mt-2 text-lg text-gray-600">
          Elige las piezas. Nosotros ensamblamos tu App.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {(["Todos", "Gestión", "Ventas"] as FilterCategory[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all",
              activeFilter === filter
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map((module) => {
          const Icon = module.icon;
          const categoryLabel = CATEGORY_MAP[module.category];

          return (
            <div
              key={module.id}
              className={cn(
                "group relative overflow-hidden rounded-lg border border-slate-200",
                "bg-white shadow-sm transition-all duration-300",
                "hover:shadow-lg hover:border-slate-300"
              )}
            >
              {/* Image Area - Placeholder with Icon */}
              <div className="relative aspect-video bg-slate-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="h-16 w-16 text-slate-400 transition-transform group-hover:scale-110" />
                </div>
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/0 to-slate-900/20 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {categoryLabel}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl font-bold text-gray-900">{module.name}</h3>

                {/* Description */}
                <p className="mb-4 text-sm text-gray-600">{module.description}</p>

                {/* Footer Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRequestDemo(module.name)}
                  className="w-full"
                >
                  Solicitar Demo
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State (if no modules match filter) */}
      {filteredModules.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <AppWindow className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-sm text-gray-600">
            No hay módulos disponibles en esta categoría.
          </p>
        </div>
      )}
    </div>
  );
}
