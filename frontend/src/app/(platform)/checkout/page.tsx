"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { Check, CreditCard, Sparkles, Crown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBillingUpgradeUrl } from "@/lib/api";

type PlanTier = "basic" | "premium" | "enterprise";

interface PlanDetails {
  name: string;
  price: number | "Consultar";
  color: string;
  gradient: string;
  badgeGradient: string;
  features: string[];
}

const planDetails: Record<PlanTier, PlanDetails> = {
  basic: {
    name: "BASIC",
    price: 99,
    color: "emerald",
    gradient: "from-emerald-500 to-green-500",
    badgeGradient: "from-emerald-500/20 to-green-500/20",
    features: [
      "Automation Level 1",
      "Basic Web Applications",
      "Standard Support",
      "Access to Panel de Control",
    ],
  },
  premium: {
    name: "PREMIUM",
    price: 299,
    color: "violet",
    gradient: "from-violet-500 to-fuchsia-500",
    badgeGradient: "from-violet-500/20 to-fuchsia-500/20",
    features: [
      "Automation Level 2",
      "Custom App Development",
      "Priority Support",
      "Full Access to All Services",
    ],
  },
  enterprise: {
    name: "ENTERPRISE",
    price: "Consultar",
    color: "amber",
    gradient: "from-amber-400 to-yellow-400",
    badgeGradient: "from-amber-500/20 to-yellow-500/20",
    features: [
      "Full Automation",
      "Data Mining (Service 3 Unlocked)",
      "Strategic Consulting",
      "24/7 Dedicated Agent",
    ],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = (searchParams.get("plan") || "basic") as PlanTier;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate plan - enterprise should redirect to plans page (uses contact modal instead)
  useEffect(() => {
    if (plan !== "basic" && plan !== "premium" && plan !== "enterprise") {
      router.push("/plans");
      return;
    }
    // Enterprise plans don't use checkout - redirect to plans page with contact modal
    if (plan === "enterprise") {
      router.push("/plans");
    }
  }, [plan, router]);

  const details = planDetails[plan] || planDetails.basic;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = Cookies.get("bai_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(getBillingUpgradeUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: "Failed to upgrade plan",
        }));
        throw new Error(errorData.detail || "Failed to upgrade plan");
      }

      // Success
      setIsSuccess(true);
      setIsProcessing(false);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
            Payment Successful!
          </h1>
          <p className="text-lg text-slate-400">
            Your plan has been upgraded to{" "}
            <span className="font-semibold text-white">{details.name}</span>
          </p>
          <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <Link
          href="/plans"
          className="mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Plans</span>
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Side - Order Summary */}
          <div className="space-y-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-white">Order Summary</h1>
              <p className="text-slate-400">Review your selection before payment</p>
            </div>

            {/* Plan Card */}
            <div
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-8 shadow-2xl backdrop-blur-sm transition-all duration-300",
                plan === "premium"
                  ? "border-violet-500/30 bg-slate-900/80 shadow-violet-500/10"
                  : "border-emerald-500/30 bg-slate-900/80 shadow-emerald-500/10"
              )}
            >
              {/* Badge */}
              <div
                className={cn(
                  "mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5",
                  plan === "premium"
                    ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20"
                    : "bg-gradient-to-r from-emerald-500/20 to-green-500/20"
                )}
              >
                {plan === "premium" ? (
                  <Sparkles className="h-4 w-4 text-violet-300" />
                ) : (
                  <Check className="h-4 w-4 text-emerald-300" />
                )}
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    plan === "premium" ? "text-violet-300" : "text-emerald-300"
                  )}
                >
                  {plan === "premium" ? "The Sweet Spot" : "The Starter"}
                </span>
              </div>

              {/* Plan Name with Gradient */}
              <h2
                className={cn(
                  "mb-4 text-3xl font-bold bg-clip-text text-transparent",
                  plan === "premium"
                    ? "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                    : "bg-gradient-to-r from-emerald-400 to-green-400"
                )}
              >
                {details.name}
              </h2>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={cn(
                    "text-5xl font-bold bg-clip-text text-transparent",
                    plan === "premium"
                      ? "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                      : "bg-gradient-to-r from-emerald-400 to-green-400"
                  )}
                >
                  {details.price}€
                </span>
                <span className="text-slate-400"> / month</span>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">What's included:</h3>
                <ul className="space-y-2">
                  {details.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          "mt-0.5 h-5 w-5 flex-shrink-0",
                          plan === "premium" ? "text-violet-400" : "text-emerald-400"
                        )}
                      />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Method */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-white">Payment Method</h2>
              <p className="text-slate-400">Complete your purchase securely</p>
            </div>

            {/* Credit Card Mockup */}
            <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <CreditCard className="h-8 w-8 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">SECURE PAYMENT</span>
              </div>

              {/* Card Number */}
              <div className="mb-6 space-y-2">
                <label className="block text-xs font-medium text-slate-400">
                  Card Number
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3">
                  <div className="h-6 w-8 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
                  <span className="text-lg tracking-wider text-slate-300">
                    •••• •••• •••• 4242
                  </span>
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400">
                    Expiry
                  </label>
                  <div className="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3">
                    <span className="text-slate-300">12/25</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400">CVV</label>
                  <div className="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3">
                    <span className="text-slate-300">•••</span>
                  </div>
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="mb-6 space-y-2">
                <label className="block text-xs font-medium text-slate-400">
                  Cardholder Name
                </label>
                <div className="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3">
                  <span className="text-slate-300">JOHN DOE</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-800/30 py-3">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-400">
                  Payment secured with SSL encryption
                </span>
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
                      plan === "premium"
                        ? "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                        : "bg-gradient-to-r from-emerald-400 to-green-400"
                    )}
                  >
                    {details.price}€
                  </span>
                  <p className="text-xs text-slate-500">per month</p>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={cn(
                  "relative w-full overflow-hidden rounded-xl px-8 py-4 font-bold text-white shadow-2xl transition-all duration-300",
                  "hover:shadow-lg hover:scale-[1.02]",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
                  "before:absolute before:inset-0 before:bg-white/20 before:opacity-0 before:transition-opacity",
                  "hover:before:opacity-100",
                  plan === "premium"
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    : "bg-gradient-to-r from-emerald-500 to-green-500"
                )}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Crown className="h-5 w-5" />
                    Confirm & Pay
                  </span>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-slate-500">
                By confirming, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

