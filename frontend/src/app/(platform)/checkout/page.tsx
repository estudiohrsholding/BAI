"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Sparkles, ArrowLeft, Lock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiPost, ApiError } from "@/lib/api-client";

type PlanTier = "motor" | "cerebro" | "partner";

interface PlanDetails {
  name: string;
  displayName: string;
  price: string;
  color: string;
  gradient: string;
  badgeGradient: string;
  features: string[];
  badge: string;
}

const planDetails: Record<PlanTier, PlanDetails> = {
  motor: {
    name: "motor",
    displayName: "Motor",
    price: "$590",
    color: "emerald",
    gradient: "from-emerald-500 to-green-500",
    badgeGradient: "from-emerald-500/20 to-green-500/20",
    badge: "El Cuerpo",
    features: [
      "Orquestación ilimitada en n8n",
      "Studio de Apps Verticales",
      "Workflows firmados (SLA 24h)",
      "Acceso básico al Neural Core",
      "Soporte en horario laboral",
    ],
  },
  cerebro: {
    name: "cerebro",
    displayName: "Cerebro",
    price: "$1,890",
    color: "violet",
    gradient: "from-violet-500 to-fuchsia-500",
    badgeGradient: "from-violet-500/20 to-fuchsia-500/20",
    badge: "La Voz",
    features: [
      "Motor completo + librería de prompts",
      "Generación de contenidos multi-formato",
      "Procesos de Data Mining supervisados",
      "Workers asíncronos dedicados",
      "Customer Success Engineer (48h SLA)",
    ],
  },
  partner: {
    name: "partner",
    displayName: "Partner",
    price: "Custom",
    color: "amber",
    gradient: "from-amber-400 to-yellow-400",
    badgeGradient: "from-amber-500/20 to-yellow-500/20",
    badge: "El Cerebro",
    features: [
      "Gemini + modelos propietarios",
      "Infra multi-tenant aislada",
      "Data Mesh + OTEL avanzado",
      "Playbooks de Growth co-creados",
      "CSM dedicado + war room semanal",
    ],
  },
};

interface CheckoutSessionResponse {
  url: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const plan = (planParam?.toLowerCase() || "motor") as PlanTier;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validar plan y redirigir si es necesario
  useEffect(() => {
    const validPlans: PlanTier[] = ["motor", "cerebro", "partner"];
    if (!validPlans.includes(plan)) {
      router.push("/#pricing");
      return;
    }
    // Partner no usa checkout directo, redirigir a contacto
    if (plan === "partner") {
      router.push("/contacto-partner");
    }
  }, [plan, router]);

  // Verificar si viene de success redirect
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setIsSuccess(true);
      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }, [searchParams, router]);

  const details = planDetails[plan] || planDetails.motor;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Usar cliente API centralizado (inyección automática de token)
      const response = await apiPost<CheckoutSessionResponse>(
        "/api/v1/billing/create-checkout-session",
        { plan }
      );

      if (!response.url) {
        throw new Error("No checkout URL received from server");
      }

      // Actualizar UI para mostrar mensaje de redirección
      setIsProcessing(false);
      setIsRedirecting(true);

      // Pequeño delay para mostrar el mensaje, luego redirigir a Stripe Checkout
      setTimeout(() => {
        window.location.href = response.url;
      }, 300);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // Token inválido - el api-client ya redirige automáticamente
          return;
        }
        setError(err.message || "Error al crear sesión de checkout");
      } else {
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
      }
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 flex items-center justify-center animate-bounce">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-xl opacity-50 animate-pulse" />
          </div>
          <h1
            className={cn(
              "text-4xl font-extrabold",
              "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400",
              "bg-clip-text text-transparent",
              "drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            )}
          >
            ¡Pago Exitoso!
          </h1>
          <p className="text-lg text-slate-400">
            Tu plan ha sido actualizado a{" "}
            <span className="font-semibold text-white">{details.displayName}</span>
          </p>
          <p className="text-sm text-slate-500">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="w-full max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/#pricing"
          className="mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Planes</span>
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Side - Order Summary */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white">Resumen del Pedido</h1>
              <p className="text-slate-400">Revisa tu selección antes del pago</p>
            </div>

            {/* Plan Card */}
            <div
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-8 shadow-2xl backdrop-blur-sm transition-all duration-300",
                plan === "cerebro"
                  ? "border-violet-500/30 bg-slate-900/80 shadow-violet-500/10"
                  : plan === "motor"
                  ? "border-emerald-500/30 bg-slate-900/80 shadow-emerald-500/10"
                  : "border-amber-500/30 bg-slate-900/80 shadow-amber-500/10"
              )}
            >
              {/* Badge */}
              <div
                className={cn(
                  "mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5",
                  plan === "cerebro"
                    ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20"
                    : plan === "motor"
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20"
                    : "bg-gradient-to-r from-amber-500/20 to-yellow-500/20"
                )}
              >
                {plan === "cerebro" ? (
                  <Sparkles className="h-4 w-4 text-violet-300" />
                ) : plan === "motor" ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-300" />
                )}
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    plan === "cerebro"
                      ? "text-violet-300"
                      : plan === "motor"
                      ? "text-emerald-300"
                      : "text-amber-300"
                  )}
                >
                  {details.badge}
                </span>
              </div>

              {/* Plan Name with Gradient */}
              <h2
                className={cn(
                  "mb-4 text-3xl font-bold bg-clip-text text-transparent",
                  plan === "cerebro"
                    ? "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                    : plan === "motor"
                    ? "bg-gradient-to-r from-emerald-400 to-green-400"
                    : "bg-gradient-to-r from-amber-400 to-yellow-400"
                )}
              >
                {details.displayName}
              </h2>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={cn(
                    "text-5xl font-bold bg-clip-text text-transparent",
                    plan === "cerebro"
                      ? "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                      : plan === "motor"
                      ? "bg-gradient-to-r from-emerald-400 to-green-400"
                      : "bg-gradient-to-r from-amber-400 to-yellow-400"
                  )}
                >
                  {details.price}
                </span>
                {details.price !== "Custom" && <span className="text-slate-400"> / mes</span>}
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">Incluye:</h3>
                <ul className="space-y-2">
                  {details.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          "mt-0.5 h-5 w-5 flex-shrink-0",
                          plan === "cerebro"
                            ? "text-violet-400"
                            : plan === "motor"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        )}
                      />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side - Secure Checkout */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-white">Checkout Seguro</h2>
              <p className="text-slate-400">Completa tu compra de forma segura vía Stripe</p>
            </div>

            {/* Payment Info Card */}
            <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-center gap-3">
                <Lock className="h-6 w-6 text-green-400" />
                <span className="text-sm font-semibold text-slate-300">Pago Seguro</span>
              </div>

              <p className="mb-8 text-center text-base text-slate-300 leading-relaxed">
                Serás redirigido a Stripe para completar tu pago de forma segura.
              </p>

              {/* Security Features */}
              <div className="space-y-3 rounded-lg bg-slate-800/30 p-4">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span>Conexión encriptada SSL</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span>Procesamiento compatible con PCI DSS</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span>Tus datos de tarjeta nunca se almacenan en nuestros servidores</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}

            {/* Total & CTA */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between border-b border-slate-700 pb-4">
                <span className="text-lg font-semibold text-slate-400">Total</span>
                <div className="text-right">
                  <span
                    className={cn(
                      "text-3xl font-bold bg-clip-text text-transparent",
                      plan === "cerebro"
                        ? "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                        : plan === "motor"
                        ? "bg-gradient-to-r from-emerald-400 to-green-400"
                        : "bg-gradient-to-r from-amber-400 to-yellow-400"
                    )}
                  >
                    {details.price}
                  </span>
                  {details.price !== "Custom" && <p className="text-xs text-slate-500">por mes</p>}
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || isRedirecting || plan === "partner"}
                className={cn(
                  "relative w-full overflow-hidden rounded-xl px-8 py-4 font-bold text-white shadow-2xl transition-all duration-300",
                  "hover:shadow-lg hover:scale-[1.02]",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
                  "before:absolute before:inset-0 before:bg-white/20 before:opacity-0 before:transition-opacity",
                  "hover:before:opacity-100",
                  plan === "cerebro"
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    : plan === "motor"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500"
                )}
              >
                {isRedirecting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redirigiendo a Stripe...
                  </span>
                ) : isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creando sesión de checkout...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Proceder al Checkout
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-slate-800/30 py-3">
                <Lock className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium text-slate-400">Protegido por Stripe</span>
              </div>

              <p className="mt-4 text-center text-xs text-slate-500">
                Al proceder, aceptas nuestros Términos de Servicio y Política de Privacidad
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
