"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { Workflow, AppWindow, DatabaseZap, Lock, CheckCircle2, Code2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMeUrl } from "@/lib/api";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  plan_tier: string;
  role?: string;
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
          // Token is invalid or expired - remove it and redirect to login
          Cookies.remove("bai_token");
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

  const greeting = getGreeting();
  const userName = getUserName();
  const planTier = user?.plan_tier || "basic";
  const isEnterprise = planTier.toLowerCase() === "enterprise";

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-slate-800" />
          <p className="mt-4 text-sm text-slate-400">Loading command center...</p>
        </div>
      </div>
    );
  }

  // Get plan tier display with dark theme colors
  const getPlanTierDisplayDark = (tier: string) => {
    const tierMap: Record<string, { label: string; color: string }> = {
      basic: { label: "PLAN BASIC", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      premium: { label: "PREMIUM", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
      enterprise: { label: "ENTERPRISE", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" }
    };
    return tierMap[tier.toLowerCase()] || tierMap.basic;
  };

  const planDisplayDark = getPlanTierDisplayDark(planTier);

  return (
    <div className="w-full space-y-8">
      {/* Command Center Header with Cyberpunk Style */}
      <div className="relative border-b border-slate-800 pb-6">
        {/* Subtle gradient background effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-500/5 via-transparent to-emerald-500/5 opacity-50" />
        
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Panel de Control
            </h1>
            <p className="mt-2 text-base text-slate-400">
              {greeting}, <span className="text-violet-400 font-medium">{userName}</span>. Systems are optimal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-lg",
                planDisplayDark.color
              )}
            >
              {isEnterprise && <Crown className="h-3 w-3" />}
              {planDisplayDark.label}
            </span>
          </div>
        </div>
      </div>

      {/* Services Grid - Cyberpunk Command Center Style */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Service 1: Automation */}
        <Link
          href="/automation"
          className={cn(
            "group relative overflow-hidden rounded-xl",
            "border border-slate-800 bg-slate-900/80 backdrop-blur",
            "shadow-lg transition-all duration-300",
            "hover:shadow-emerald-500/20 hover:border-emerald-500/50 hover:-translate-y-1",
            "p-8 flex flex-col",
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/0 before:to-emerald-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Workflow className="h-10 w-10 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Active</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-semibold text-white">Automation</h2>
            <p className="text-sm text-slate-400">
              Orchestrate workflows & AI agents for seamless business operations.
            </p>
          </div>
        </Link>

        {/* Service 2: Software */}
        <Link
          href="/software"
          className={cn(
            "group relative overflow-hidden rounded-xl",
            "border border-slate-800 bg-slate-900/80 backdrop-blur",
            "shadow-lg transition-all duration-300",
            "hover:shadow-violet-500/20 hover:border-violet-500/50 hover:-translate-y-1",
            "p-8 flex flex-col",
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-violet-500/0 before:to-fuchsia-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
              <AppWindow className="h-10 w-10 text-violet-400" />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-1">
              <Code2 className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-medium text-violet-400">Development</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">Software</h2>
              {!isEnterprise && <Lock className="h-4 w-4 text-slate-500" />}
            </div>
            <p
              className={cn(
                "text-sm text-slate-400",
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
            "group relative overflow-hidden rounded-xl",
            "border border-slate-800 bg-slate-900/80 backdrop-blur",
            "shadow-lg transition-all duration-300",
            "hover:shadow-amber-500/20 hover:border-amber-500/50 hover:-translate-y-1",
            "p-8 flex flex-col",
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-amber-500/0 before:to-yellow-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
            !isEnterprise && "opacity-75"
          )}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <DatabaseZap className="h-10 w-10 text-amber-400" />
            </div>
            {!isEnterprise && (
              <div className="flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-3 py-1">
                <Lock className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-400">Premium</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">Data Mining</h2>
              {!isEnterprise && <Lock className="h-4 w-4 text-slate-500" />}
            </div>
            <p
              className={cn(
                "text-sm text-slate-400",
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
          "rounded-xl border p-6 backdrop-blur",
          isEnterprise
            ? "border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/10"
            : "border-slate-800 bg-slate-900/50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEnterprise ? (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Enterprise Status
                  </h3>
                </div>
                <p className="text-sm text-slate-400">
                  You are running on maximum power. B.A.I. is fully dedicated to you.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Subscription Status
                </h3>
                <p className="text-sm text-slate-400">
                  You are limiting your potential. Unlock Data Mining & Priority Support.
                </p>
              </div>
            )}
          </div>
          {!isEnterprise && (
            <div>
              <Link 
                href="/plans"
                className="inline-block whitespace-nowrap rounded-md bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-base font-semibold text-white transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-lg hover:shadow-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Upgrade to Premium
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

