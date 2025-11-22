"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { Workflow, AppWindow, DatabaseZap, Lock, CheckCircle2, Code2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMeUrl } from "@/lib/api";
import { Button } from "@/components/atoms/Button";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  plan_tier: string;
  is_active: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("bai_token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(getMeUrl(), {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load user data");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Get dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get user's name or fallback
  const getUserName = () => {
    if (user?.full_name) {
      const firstName = user.full_name.split(" ")[0];
      return firstName;
    }
    return user?.email?.split("@")[0] || "Admin";
  };

  // Get plan tier display
  const getPlanTierDisplay = (tier: string) => {
    const tierMap: Record<string, { label: string; color: string }> = {
      basic: { label: "PLAN BASIC", color: "bg-slate-100 text-slate-700 border-slate-200" },
      premium: { label: "PREMIUM", color: "bg-blue-100 text-blue-700 border-blue-200" },
      enterprise: { label: "ENTERPRISE", color: "bg-amber-100 text-amber-700 border-amber-300" }
    };
    return tierMap[tier.toLowerCase()] || tierMap.basic;
  };

  const greeting = getGreeting();
  const userName = getUserName();
  const planTier = user?.plan_tier || "basic";
  const planDisplay = getPlanTierDisplay(planTier);
  const isEnterprise = planTier.toLowerCase() === "enterprise";

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-slate-200" />
          <p className="mt-4 text-sm text-slate-600">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Command Center Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
            <p className="mt-2 text-base text-slate-600">
              {greeting}, {userName}. Systems are optimal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide",
                planDisplay.color
              )}
            >
              {isEnterprise && <Crown className="h-3 w-3" />}
              {planDisplay.label}
            </span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Service 1: Automation */}
        <Link
          href="/automation"
          className={cn(
            "group relative overflow-hidden rounded-lg",
            "border border-slate-200 bg-white",
            "shadow-sm transition-all duration-200",
            "hover:shadow-lg hover:border-slate-300",
            "p-8 flex flex-col"
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-50">
              <Workflow className="h-10 w-10 text-slate-800" />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Active</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-semibold text-slate-900">Automation</h2>
            <p className="text-sm text-slate-600">
              Orchestrate workflows & AI agents for seamless business operations.
            </p>
          </div>
        </Link>

        {/* Service 2: Software */}
        <Link
          href="/software"
          className={cn(
            "group relative overflow-hidden rounded-lg",
            "border border-slate-200 bg-white",
            "shadow-sm transition-all duration-200",
            "hover:shadow-lg hover:border-slate-300",
            "p-8 flex flex-col"
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-50">
              <AppWindow className="h-10 w-10 text-slate-800" />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
              <Code2 className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Development</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900">Software</h2>
              {!isEnterprise && <Lock className="h-4 w-4 text-slate-400" />}
            </div>
            <p
              className={cn(
                "text-sm text-slate-600",
                !isEnterprise && "blur-[1px] opacity-60"
              )}
            >
              Build scalable applications & monetized products with modular architecture.
            </p>
          </div>
        </Link>

        {/* Service 3: Data Mining */}
        <Link
          href="/data"
          className={cn(
            "group relative overflow-hidden rounded-lg",
            "border border-slate-200 bg-white",
            "shadow-sm transition-all duration-200",
            "hover:shadow-lg hover:border-slate-300",
            "p-8 flex flex-col",
            !isEnterprise && "opacity-75"
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-50">
              <DatabaseZap className="h-10 w-10 text-slate-800" />
            </div>
            {!isEnterprise && (
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <Lock className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Premium</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900">Data Mining</h2>
              {!isEnterprise && <Lock className="h-4 w-4 text-slate-400" />}
            </div>
            <p
              className={cn(
                "text-sm text-slate-600",
                !isEnterprise && "blur-[1px] opacity-60"
              )}
            >
              Strategic intelligence & predictive analysis powered by market data.
            </p>
          </div>
        </Link>
      </div>

      {/* Subscription Status Widget */}
      <div
        className={cn(
          "rounded-lg border p-6",
          isEnterprise
            ? "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50"
            : "border-slate-200 bg-slate-50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEnterprise ? (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Enterprise Status
                  </h3>
                </div>
                <p className="text-sm text-slate-700">
                  You are running on maximum power. B.A.I. is fully dedicated to you.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  Subscription Status
                </h3>
                <p className="text-sm text-slate-700">
                  You are limiting your potential. Unlock Data Mining & Priority Support.
                </p>
              </div>
            )}
          </div>
          {!isEnterprise && (
            <div>
              <Link href="/plans">
                <Button className="whitespace-nowrap">Upgrade to Premium</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

