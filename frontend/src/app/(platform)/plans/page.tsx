"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Crown, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="relative min-h-full bg-slate-950">
        {/* Dark Background with Spotlight Effect */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
        </div>

        <div className="space-y-12 px-4 py-12 lg:px-8">
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
              Selecciona tu Nivel de Poder
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Elige el plan que impulse tu imperio digital
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* PLAN BASIC - The Starter */}
            <div
              className={cn(
                "group relative overflow-hidden rounded-2xl border",
                "border-emerald-500/30 bg-slate-900/80 backdrop-blur-sm",
                "p-8 shadow-lg shadow-emerald-500/10",
                "transition-all duration-300",
                "hover:shadow-emerald-500/20 hover:border-emerald-500/50"
              )}
            >
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  The Starter
                </span>
              </div>

              {/* Title */}
              <h2 className="mb-2 text-2xl font-bold text-white">BASIC</h2>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-emerald-400">99€</span>
                <span className="text-slate-400"> / mes</span>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span className="text-sm text-slate-300">Automation Level 1</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span className="text-sm text-slate-300">Basic Web</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <span className="text-sm text-slate-300">Standard Support</span>
                </li>
              </ul>

              {/* CTA Button */}
              <Link
                href="/checkout?plan=basic"
                className={cn(
                  "block w-full rounded-lg border border-emerald-500/50 bg-emerald-500/10",
                  "px-6 py-3 text-center font-semibold text-emerald-400",
                  "transition-all duration-200",
                  "hover:bg-emerald-500/20 hover:border-emerald-500"
                )}
              >
                Comenzar
              </Link>
            </div>

            {/* PLAN PREMIUM - The Sweet Spot */}
            <div
              className={cn(
                "group relative rounded-2xl",
                "bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10",
                "p-[2px] shadow-xl",
                "transition-all duration-300",
                "hover:shadow-2xl hover:shadow-violet-500/30"
              )}
            >
              <div
                className={cn(
                  "h-full w-full rounded-2xl",
                  "bg-slate-900/95 backdrop-blur-sm",
                  "p-8"
                )}
              >
                {/* Popular Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 px-3 py-1">
                  <Sparkles className="h-3 w-3 text-violet-300" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                    The Sweet Spot
                  </span>
                </div>

                {/* Title with Gradient */}
                <h2
                  className={cn(
                    "mb-2 text-2xl font-bold",
                    "bg-gradient-to-r from-violet-400 to-fuchsia-400",
                    "bg-clip-text text-transparent"
                  )}
                >
                  PREMIUM
                </h2>

                {/* Price */}
                <div className="mb-6">
                  <span
                    className={cn(
                      "text-4xl font-bold",
                      "bg-gradient-to-r from-violet-400 to-fuchsia-400",
                      "bg-clip-text text-transparent"
                    )}
                  >
                    299€
                  </span>
                  <span className="text-slate-400"> / mes</span>
                </div>

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-400" />
                    <span className="text-sm text-slate-300">Automation Level 2</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-400" />
                    <span className="text-sm text-slate-300">Custom App</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-400" />
                    <span className="text-sm text-slate-300">Priority Support</span>
                  </li>
                </ul>

                {/* CTA Button */}
                <Link
                  href="/checkout?plan=premium"
                  className={cn(
                    "block w-full rounded-lg",
                    "bg-gradient-to-r from-violet-500 to-fuchsia-500",
                    "px-6 py-3 text-center font-semibold text-white",
                    "transition-all duration-200",
                    "hover:from-violet-600 hover:to-fuchsia-600",
                    "hover:shadow-lg hover:shadow-violet-500/50"
                  )}
                >
                  Elegir Premium
                </Link>
              </div>
            </div>

            {/* PLAN ENTERPRISE - The Legendary */}
            <div
              className={cn(
                "group relative overflow-hidden rounded-2xl border",
                "border-amber-400/50 bg-slate-900/95 backdrop-blur-sm",
                "p-8 shadow-2xl shadow-amber-500/20",
                "transition-all duration-300",
                "hover:shadow-amber-500/40 hover:border-amber-400",
                // Legendary glow effect
                "before:absolute before:-inset-1 before:rounded-2xl",
                "before:bg-gradient-to-r before:from-amber-400 before:via-yellow-400 before:to-amber-400",
                "before:opacity-0 before:blur-xl before:transition-opacity",
                "hover:before:opacity-30"
              )}
            >
              {/* Legendary Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1">
                <Crown className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                  The Legendary
                </span>
              </div>

              {/* Title with Metallic Gold Gradient */}
              <h2
                className={cn(
                  "mb-2 text-2xl font-bold",
                  "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400",
                  "bg-clip-text text-transparent",
                  "drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                )}
              >
                ENTERPRISE
              </h2>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={cn(
                    "text-4xl font-bold",
                    "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400",
                    "bg-clip-text text-transparent"
                  )}
                >
                  Consultar
                </span>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                  <span className="text-sm text-slate-300">Full Automation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                  <span className="text-sm text-slate-300">
                    Data Mining (Service 3 Unlocked)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                  <span className="text-sm text-slate-300">Strategic Consulting</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                  <span className="text-sm text-slate-300">24/7 Dedicated Agent</span>
                </li>
              </ul>

              {/* CTA Button */}
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
                Contactar Ventas
              </button>
            </div>
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
    </div>
  );
}
