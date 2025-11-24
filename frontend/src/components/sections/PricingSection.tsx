"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Mail,
  X,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  tagline: string;
  price: string;
  period: string;
  theme: "emerald" | "violet" | "amber";
  isPopular?: boolean;
  buttonText: string;
  buttonHref?: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "BASIC",
    tagline: "Tu Recepcionista Omnicanal",
    price: "99€",
    period: "/ mes",
    theme: "emerald",
    buttonText: "Comenzar Ahora",
    buttonHref: "/checkout?plan=basic",
    features: [
      "Chatbot Web + Instagram + Facebook",
      "Atención 24/7 (Respuestas Rápidas)",
      "Gestión de Citas y Reservas",
      "Respuesta Automática a Reseñas",
      "Límite: 500 Conversaciones/mes",
    ],
  },
  {
    name: "PREMIUM",
    tagline: "Tu Agencia de Marketing IA",
    price: "399€",
    period: "/ mes",
    theme: "violet",
    isPopular: true,
    buttonText: "Contratar Agencia IA",
    buttonHref: "/checkout?plan=premium",
    features: [
      "Todo lo incluido en Basic",
      "Integración WhatsApp Business",
      "Creación de Contenido (Posts & Copy)",
      "Video Marketing IA (4 Reels/mes)",
      "Influencer de Marca (20 Img/mes)",
      "Auto-Publicación en Redes",
      "Data Mining: Tendencias Virales",
      "Límite: 2.000 Conversaciones/mes",
    ],
  },
  {
    name: "ENTERPRISE",
    tagline: "Dominio Total del Mercado",
    price: "Consultar",
    period: "",
    theme: "amber",
    buttonText: "Contactar Socio",
    features: [
      "Automatización Ilimitada",
      "Modelos IA Personalizados (Fine-tuning)",
      "Herramientas de Extracción Ultrapotentes",
      "Análisis de Mercados y Deep Learning",
      "Estrategia de Expansión Dedicada",
      "Soporte Prioritario CEO-to-CEO",
    ],
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
    console.log("Enterprise Contact Form:", formData);
    alert("¡Solicitud enviada! Nos pondremos en contacto contigo pronto.");
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

  const isAIFeature = (feature: string) => {
    return (
      feature.includes("Video Marketing") ||
      feature.includes("Influencer de Marca") ||
      feature.includes("Creación de Contenido") ||
      feature.includes("Auto-Publicación")
    );
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center">
            <h2
              className={cn(
                "text-5xl font-extrabold md:text-6xl",
                "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600",
                "bg-clip-text text-transparent",
                "drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
              )}
            >
              Elige tu Nivel de Impacto
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Desde automatizar respuestas hasta generar contenido viral. B.A.I. escala contigo.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {PLANS.map((plan) => {
              const isPremium = plan.isPopular;
              const isEnterprise = plan.theme === "amber";
              const themeClasses = getThemeClasses(plan.theme, isPremium || false);

              return (
                <div
                  key={plan.name}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border",
                    "bg-slate-900/90 backdrop-blur p-8 shadow-lg",
                    "transition-all duration-300 hover:scale-105",
                    themeClasses.border,
                    themeClasses.shadow,
                    themeClasses.hoverShadow,
                    themeClasses.hoverBorder
                  )}
                >
                  {/* Premium Gradient Border Effect */}
                  {isPremium && (
                    <div
                      className={cn(
                        "absolute -inset-[2px] rounded-2xl",
                        "bg-gradient-to-r from-violet-500 to-fuchsia-500",
                        "opacity-20 blur-sm group-hover:opacity-30",
                        "transition-opacity duration-300"
                      )}
                    />
                  )}

                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <div
                      className={cn(
                        "mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1",
                        themeClasses.bg
                      )}
                    >
                      <Sparkles className="h-3 w-3 text-violet-300" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                        RECOMENDADO
                      </span>
                    </div>
                  )}

                  {/* Tagline */}
                  <p
                    className={cn(
                      "mb-2 text-sm font-medium",
                      isPremium
                        ? "bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
                        : themeClasses.text
                    )}
                  >
                    {plan.tagline}
                  </p>

                  {/* Title */}
                  <h3
                    className={cn(
                      "mb-2 text-2xl font-bold",
                      isPremium || isEnterprise
                        ? themeClasses.textGradient
                        : themeClasses.text
                    )}
                  >
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
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
                      <span className="text-slate-400"> {plan.period}</span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, index) => {
                      const isAI = isAIFeature(feature);
                      const Icon = isAI ? Sparkles : Check;

                      return (
                        <li key={index} className="flex items-start gap-3">
                          <Icon
                            className={cn(
                              "mt-0.5 h-5 w-5 flex-shrink-0",
                              isAI && isPremium
                                ? "text-fuchsia-400"
                                : isPremium
                                ? "text-violet-400"
                                : isEnterprise
                                ? "text-amber-400"
                                : "text-emerald-400"
                            )}
                          />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA Button */}
                  {isEnterprise ? (
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-lg",
                        "px-6 py-3 font-semibold transition-all duration-200",
                        themeClasses.button
                      )}
                    >
                      <Mail className="h-4 w-4" />
                      {plan.buttonText}
                    </button>
                  ) : (
                    <Link
                      href={plan.buttonHref || "#"}
                      className={cn(
                        "block w-full rounded-lg text-center font-semibold",
                        "px-6 py-3 transition-all duration-200",
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

          {/* Additional Info */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-slate-500">
              Todos los planes incluyen acceso al Panel de Control y soporte técnico básico.
              <br />
              ¿Necesitas algo más personalizado?{" "}
              <button
                onClick={() => setIsContactOpen(true)}
                className="font-semibold text-amber-400 hover:text-amber-300 underline"
              >
                Contacta con nuestro equipo
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {isContactOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsContactOpen(false)}
        >
          <div
            className={cn(
              "relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl",
              "animate-in fade-in zoom-in-95 duration-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-400" />
                <h2
                  className={cn(
                    "text-2xl font-bold",
                    "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400",
                    "bg-clip-text text-transparent"
                  )}
                >
                  Contactar con Equipo Enterprise
                </h2>
              </div>
              <p className="text-sm text-slate-400">
                Completa el formulario y nos pondremos en contacto contigo.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={cn(
                    "w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3",
                    "text-white placeholder-slate-500",
                    "focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50",
                    "transition-colors"
                  )}
                  placeholder="Tu nombre completo"
                />
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={cn(
                    "w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3",
                    "text-white placeholder-slate-500",
                    "focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50",
                    "transition-colors"
                  )}
                  placeholder="tu@email.com"
                />
              </div>

              {/* Message Textarea */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={cn(
                    "w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3",
                    "text-white placeholder-slate-500",
                    "focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50",
                    "resize-none transition-colors"
                  )}
                  placeholder="Cuéntanos sobre tu proyecto..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsContactOpen(false)}
                  className={cn(
                    "flex-1 rounded-lg border border-slate-600 bg-slate-800 px-6 py-3",
                    "font-semibold text-slate-300 transition-colors",
                    "hover:bg-slate-700 hover:text-white"
                  )}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={cn(
                    "flex-1 rounded-lg",
                    "bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3",
                    "font-semibold text-white transition-all",
                    "hover:from-amber-600 hover:to-yellow-600",
                    "hover:shadow-lg hover:shadow-amber-500/50"
                  )}
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

