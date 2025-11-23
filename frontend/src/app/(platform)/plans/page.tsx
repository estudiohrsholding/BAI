"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Zap, Shield, Mail, X, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  tagline: string;
  price: string;
  period: string;
  colorTheme: {
    primary: string;
    secondary: string;
    shadow: string;
    gradient?: string;
  };
  buttonText: string;
  buttonHref?: string;
  buttonAction?: () => void;
  features: string[];
  badge?: string;
  highlightFeatures?: boolean; // For Premium AI features
}

const PLANS: Plan[] = [
  {
    name: "BASIC",
    tagline: "Tu Recepcionista Omnicanal",
    price: "99€",
    period: "/ mes",
    colorTheme: {
      primary: "emerald-500",
      secondary: "emerald-400",
      shadow: "shadow-emerald-500/20",
    },
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
    colorTheme: {
      primary: "violet-500",
      secondary: "fuchsia-500",
      shadow: "shadow-fuchsia-500/40",
      gradient: "from-violet-500 to-fuchsia-500",
    },
    buttonText: "Contratar Agencia IA",
    buttonHref: "/checkout?plan=premium",
    badge: "RECOMENDADO",
    highlightFeatures: true,
    features: [
      "Chatbot Web + Instagram + Facebook",
      "Atención 24/7 (Respuestas Rápidas)",
      "Gestión de Citas y Reservas",
      "Respuesta Automática a Reseñas",
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
    colorTheme: {
      primary: "amber-400",
      secondary: "amber-500",
      shadow: "shadow-amber-500/50",
    },
    buttonText: "Contactar Socio",
    features: [
      "Automatización Ilimitada",
      "Modelos IA Personalizados (Fine-tuning)",
      "Estrategia de Expansión Dedicada",
      "Soporte Prioritario CEO-to-CEO",
    ],
  },
];

export default function PlansPage() {
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

  return (
    <div className="relative min-h-[calc(100vh)] bg-slate-950 text-white overflow-x-hidden">
        {/* Dark Background with Spotlight Effect */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
        </div>

        <div className="space-y-12 py-20 px-8 md:px-12">
          {/* Header */}
          <div className="text-center">
            <h1
              className={cn(
                "text-5xl font-extrabold md:text-6xl",
                "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600",
                "bg-clip-text text-transparent",
                "drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
              )}
            >
              Elige tu Nivel de Impacto
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Desde automatizar respuestas hasta generar contenido viral. B.A.I. escala contigo.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {PLANS.map((plan) => {
              const isPremium = plan.name === "PREMIUM";
              const isEnterprise = plan.name === "ENTERPRISE";

              return (
                <div
                  key={plan.name}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border",
                    "bg-slate-900/80 backdrop-blur-sm p-8 shadow-lg",
                    "transition-all duration-300 hover:scale-105",
                    // Border and shadow based on plan
                    isPremium
                      ? "border-violet-500/30 shadow-violet-500/10 hover:shadow-violet-500/20 hover:border-violet-500/50"
                      : isEnterprise
                      ? "border-amber-400/50 shadow-amber-500/20 hover:shadow-amber-500/40 hover:border-amber-400"
                      : "border-emerald-500/30 shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:border-emerald-500/50"
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

                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className={cn(
                        "mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1",
                        isPremium
                          ? "bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30"
                          : ""
                      )}
                    >
                      {isPremium && <Sparkles className="h-3 w-3 text-violet-300" />}
                      <span
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wide",
                          isPremium ? "text-violet-300" : ""
                        )}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Tagline */}
                  <p
                    className={cn(
                      "mb-2 text-sm font-medium",
                      isPremium
                        ? "bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
                        : isEnterprise
                        ? "text-amber-400"
                        : "text-emerald-400"
                    )}
                  >
                    {plan.tagline}
                  </p>

                  {/* Title */}
                  <h2
                    className={cn(
                      "mb-2 text-2xl font-bold",
                      isPremium
                        ? "bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
                        : isEnterprise
                        ? "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "text-emerald-400"
                    )}
                  >
                    {plan.name}
                  </h2>

                  {/* Price */}
                  <div className="mb-6">
                    <span
                      className={cn(
                        "text-4xl font-bold",
                        isPremium
                          ? "bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"
                          : isEnterprise
                          ? "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
                          : "text-emerald-400"
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
                      const isAIFeature =
                        plan.highlightFeatures &&
                        (feature.includes("Video Marketing") ||
                          feature.includes("Influencer de Marca"));
                      const Icon = isAIFeature ? Sparkles : Check;

                      return (
                        <li key={index} className="flex items-start gap-3">
                          <Icon
                            className={cn(
                              "mt-0.5 h-5 w-5 flex-shrink-0",
                              isPremium
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
                        "border border-amber-400/50 bg-amber-500/10",
                        "px-6 py-3 font-semibold text-amber-400",
                        "transition-all duration-200",
                        "hover:bg-amber-500/20 hover:border-amber-400",
                        "hover:shadow-lg hover:shadow-amber-500/50"
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
                        isPremium
                          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 hover:shadow-lg hover:shadow-violet-500/50"
                          : "border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500"
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
      </div>
  );
}
