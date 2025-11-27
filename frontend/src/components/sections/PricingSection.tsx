"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Mail,
  X,
  Crown,
  Zap,
  Eye,
  Video,
  Image as ImageIcon,
  Megaphone,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Interfaces & Tipos ---

interface Plan {
  name: string;
  tagline: string;
  price: string;
  period: string;
  setupFee?: string; // Nuevo: Para mostrar el pago único
  theme: "emerald" | "violet" | "amber";
  isPopular?: boolean;
  buttonText: string;
  buttonHref?: string;
  features: string[];
}

interface Booster {
  name: string;
  price: string;
  period?: string; // ej: "/mes" o nada si es one-off
  description: string;
  icon: any;
  category: "Data" | "Content" | "Growth";
}

// --- Configuración de Datos (La Verdad del Negocio) ---

const PLANS: Plan[] = [
  {
    name: "MOTOR",
    tagline: "La Base Operativa",
    price: "199€",
    period: "/ mes",
    setupFee: "499€ Setup Inicial",
    theme: "emerald",
    buttonText: "Iniciar Motor",
    buttonHref: "/checkout?plan=motor",
    features: [
      "Chatbot Omnicanal (Web + IG + FB)",
      "Gestión de Citas Automática",
      "Respuesta Inteligente a Reseñas",
      "Dashboard de Control Básico",
      "Soporte vía Ticket",
    ],
  },
  {
    name: "CEREBRO",
    tagline: "El Motor de Crecimiento",
    price: "499€",
    period: "/ mes",
    setupFee: "999€ Setup Inicial",
    theme: "violet",
    isPopular: true, // Este es el que queremos vender
    buttonText: "Activar Agencia IA",
    buttonHref: "/checkout?plan=cerebro",
    features: [
      "Todo lo incluido en Motor",
      "WhatsApp Business Inteligente",
      "Pack Contenido (4 Posts + 1 Reel/mes)",
      "1 Informe de Mercado Mensual",
      "Prioridad de Soporte Media",
      "Acceso a Marketplace de Boosters",
    ],
  },
  {
    name: "PARTNER",
    tagline: "Socio Tecnológico Total",
    price: "2.500€", // Desde
    period: "/ mes (Desde)",
    theme: "amber",
    buttonText: "Hablar con Socio",
    features: [
      "Despliegue de Software a Medida",
      "Automatización n8n Ilimitada",
      "Minería de Datos Profunda",
      "Fine-tuning de Modelos IA",
      "Estrategia Geoespacial",
      "Soporte Directo CEO-to-CEO",
    ],
  },
];

const BOOSTERS: Booster[] = [
  {
    name: "El Espía",
    price: "99€",
    description: "Informe de inteligencia: Precios y debilidades de 3 competidores.",
    icon: Eye,
    category: "Data",
  },
  {
    name: "Radar Viral",
    price: "149€",
    period: "/ mes",
    description: "Alerta semanal de tendencias virales en tu sector.",
    icon: Zap,
    category: "Data",
  },
  {
    name: "Viralidad IA",
    price: "199€",
    description: "Pack de 4 Reels/TikToks editados con guion y voz IA.",
    icon: Video,
    category: "Content",
  },
  {
    name: "Influencer Brand",
    price: "99€",
    description: "20 Imágenes de alta calidad para redes sociales.",
    icon: ImageIcon,
    category: "Content",
  },
  {
    name: "Reactiva Base",
    price: "199€",
    description: "Campaña masiva de WhatsApp para recuperar clientes.",
    icon: Megaphone,
    category: "Growth",
  },
];

export function PricingSection() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí conectaríamos con n8n o tu backend FastAPI en el futuro
    console.log("Enterprise Contact Form:", formData);
    alert("¡Solicitud enviada! Un socio se pondrá en contacto contigo.");
    setIsContactOpen(false);
    setFormData({ name: "", email: "", message: "" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Helper para estilos dinámicos (Manteniendo tu estética)
  const getThemeClasses = (theme: string, isPremium: boolean) => {
    switch (theme) {
      case "emerald":
        return {
          text: "text-emerald-400",
          textGradient: "text-emerald-400",
          border: "border-emerald-500/30",
          shadow: "shadow-emerald-500/20",
          hoverShadow: "hover:shadow-emerald-500/30",
          hoverBorder: "hover:border-emerald-500/50",
          bg: "bg-emerald-500/10",
          button: "border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500",
        };
      case "violet":
        return {
          text: "text-violet-400",
          textGradient: "bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent",
          border: "border-violet-500/30",
          shadow: "shadow-violet-500/10",
          hoverShadow: "hover:shadow-violet-500/20",
          hoverBorder: "hover:border-violet-500/50",
          bg: "bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30",
          button: isPremium
            ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 hover:shadow-lg hover:shadow-violet-500/50"
            : "",
        };
      case "amber":
        return {
          text: "text-amber-400",
          textGradient: "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
          border: "border-amber-400/50",
          shadow: "shadow-amber-500/20",
          hoverShadow: "hover:shadow-amber-500/40",
          hoverBorder: "hover:border-amber-400",
          bg: "bg-amber-500/20",
          button: "border border-amber-400/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/50",
        };
      default:
        return {};
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-t border-slate-800">
      <div className="container mx-auto max-w-7xl">
        <div className="space-y-16">
          
          {/* Header Principal */}
          <div className="text-center space-y-4">
            <h2
              className={cn(
                "text-5xl font-extrabold md:text-6xl",
                "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600",
                "bg-clip-text text-transparent",
                "drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]"
              )}
            >
              Arquitectura de Negocio
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-400">
              Elige el motor que impulsará tu empresa. Desde automatización básica hasta consultoría tecnológica integral.
            </p>
          </div>

          {/* --- GRID DE PLANES PRINCIPALES (CORE) --- */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative z-10">
            {PLANS.map((plan) => {
              const isPremium = plan.isPopular;
              const isEnterprise = plan.theme === "amber";
              const themeClasses = getThemeClasses(plan.theme, isPremium || false);

              return (
                <div
                  key={plan.name}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border",
                    "bg-slate-950/80 backdrop-blur-md p-8 shadow-xl",
                    "flex flex-col",
                    "transition-all duration-300 hover:scale-[1.02]",
                    themeClasses.border,
                    themeClasses.shadow,
                    themeClasses.hoverShadow,
                    themeClasses.hoverBorder
                  )}
                >
                  {/* Premium Glow Effect */}
                  {isPremium && (
                    <div
                      className={cn(
                        "absolute -inset-[2px] rounded-2xl",
                        "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500",
                        "opacity-10 blur-xl group-hover:opacity-20",
                        "transition-opacity duration-500 animate-pulse"
                      )}
                    />
                  )}

                  {/* Badge de Recomendado */}
                  {plan.isPopular && (
                    <div
                      className={cn(
                        "mb-6 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1",
                        themeClasses.bg
                      )}
                    >
                      <Sparkles className="h-3 w-3 text-violet-300 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wide text-violet-300">
                        Estrategia Recomendada
                      </span>
                    </div>
                  )}

                  {/* Cabecera del Plan */}
                  <div className="mb-6">
                    <h3
                      className={cn(
                        "text-3xl font-bold tracking-tight mb-2",
                        isPremium || isEnterprise
                          ? themeClasses.textGradient
                          : themeClasses.text
                      )}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-400">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="mb-8 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-4xl font-bold",
                          isPremium || isEnterprise
                            ? themeClasses.textGradient
                            : themeClasses.text
                        )}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-slate-400 font-medium">{plan.period}</span>
                      )}
                    </div>
                    {/* Setup Fee (Vital para tu estrategia) */}
                    {plan.setupFee && (
                      <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-slate-500"/>
                        {plan.setupFee}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-8 space-y-4 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check
                          className={cn(
                            "mt-1 h-4 w-4 flex-shrink-0",
                            isPremium
                              ? "text-fuchsia-400"
                              : isEnterprise
                              ? "text-amber-400"
                              : "text-emerald-400"
                          )}
                        />
                        <span className="text-sm text-slate-300 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isEnterprise ? (
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-lg",
                        "px-6 py-4 font-bold transition-all duration-200",
                        themeClasses.button
                      )}
                    >
                      <Crown className="h-4 w-4" />
                      {plan.buttonText}
                    </button>
                  ) : (
                    <Link
                      href={plan.buttonHref || "#"}
                      className={cn(
                        "block w-full rounded-lg text-center font-bold",
                        "px-6 py-4 transition-all duration-200",
                        themeClasses.button
                      )}
                    >
                      {plan.buttonText}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* --- SECCIÓN DE BOOSTERS (Add-ons) --- */}
          <div className="mt-24 pt-16 border-t border-slate-800">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">
                Marketplace de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Boosters</span>
              </h3>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Potencia tu plan con módulos de inteligencia y contenido bajo demanda. 
                Paga solo por lo que necesitas, cuando lo necesitas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {BOOSTERS.map((booster, idx) => {
                const Icon = booster.icon;
                return (
                  <div 
                    key={idx}
                    className="group bg-slate-900/40 border border-slate-800 hover:border-slate-600 p-5 rounded-xl transition-all hover:bg-slate-900/60 flex flex-col"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className={cn(
                        "p-2 rounded-lg",
                        booster.category === "Data" ? "bg-blue-500/10 text-blue-400" :
                        booster.category === "Content" ? "bg-pink-500/10 text-pink-400" :
                        "bg-amber-500/10 text-amber-400"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-mono text-slate-500 uppercase">{booster.category}</span>
                    </div>
                    
                    <h4 className="font-bold text-slate-200 mb-1">{booster.name}</h4>
                    <p className="text-xs text-slate-400 mb-4 flex-1">{booster.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white">{booster.price}</span>
                        {booster.period && <span className="text-[10px] text-slate-500">{booster.period}</span>}
                      </div>
                      <button className="text-xs font-semibold text-slate-300 group-hover:text-white flex items-center gap-1 transition-colors">
                        Añadir <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mx-auto max-w-2xl text-center mt-12">
            <p className="text-sm text-slate-500">
              Todos los planes incluyen acceso seguro SSL, actualizaciones de IA y hosting en servidores de alta velocidad.
              <br />
              ¿Dudas sobre el Setup Fee?{" "}
              <button
                onClick={() => setIsContactOpen(true)}
                className="font-semibold text-amber-400 hover:text-amber-300 underline decoration-amber-400/30 underline-offset-4"
              >
                Hablemos claro
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Contact Modal (Manteniendo funcionalidad original) */}
      {isContactOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setIsContactOpen(false)}
        >
          <div
            className={cn(
              "relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl",
              "animate-in fade-in zoom-in-95 duration-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-white">
                  Contacto Directo
                </h2>
              </div>
              <p className="text-sm text-slate-400">
                Estamos buscando socios, no solo clientes. Cuéntanos tu visión.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-300">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none transition-colors"
                  placeholder="¿Qué buscas automatizar?"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsContactOpen(false)}
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
