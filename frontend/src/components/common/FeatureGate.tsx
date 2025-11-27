"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export type PlanTier = "MOTOR" | "CEREBRO" | "PARTNER";

const PLAN_PRIORITY: PlanTier[] = ["MOTOR", "CEREBRO", "PARTNER"];

interface FeatureGateProps {
  requiredPlan: PlanTier;
  currentPlan: PlanTier;
  children: ReactNode;
  className?: string;
  upgradeHref?: string;
  title?: string;
  description?: string;
}

export function FeatureGate({
  requiredPlan,
  currentPlan,
  children,
  className,
  upgradeHref = "/#pricing",
  title = "Función bloqueada",
  description = "Actualiza tu plan para activar esta capacidad.",
}: FeatureGateProps) {
  const hasAccess =
    PLAN_PRIORITY.indexOf(currentPlan) >= PLAN_PRIORITY.indexOf(requiredPlan);

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none blur-sm brightness-75">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border border-violet-500/40 bg-slate-950/80 px-6 text-center shadow-2xl backdrop-blur">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-violet-500/40 bg-violet-950/40">
          <Lock className="h-6 w-6 text-violet-300" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="text-sm text-slate-400">
            {description} (Necesitas {requiredPlan})
          </p>
        </div>
        <Link
          href={upgradeHref}
          className="inline-flex items-center justify-center rounded-2xl border border-violet-500/40 bg-violet-600/20 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-600/30"
        >
          Upgrade para desbloquear
        </Link>
      </div>
    </div>
  );
}

