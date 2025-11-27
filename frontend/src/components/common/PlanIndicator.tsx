"use client";

import { CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type PlanTier = "MOTOR" | "CEREBRO" | "PARTNER";

interface PlanIndicatorProps {
  requiredPlan: PlanTier;
  currentPlan?: PlanTier;
  className?: string;
}

const PLAN_COLORS: Record<PlanTier, { bg: string; border: string; text: string; icon: string }> = {
  MOTOR: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: "text-emerald-400",
  },
  CEREBRO: {
    bg: "bg-violet-500/20",
    border: "border-violet-500/30",
    text: "text-violet-400",
    icon: "text-violet-400",
  },
  PARTNER: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/30",
    text: "text-amber-400",
    icon: "text-amber-400",
  },
};

const PLAN_LABELS: Record<PlanTier, string> = {
  MOTOR: "Motor",
  CEREBRO: "Cerebro",
  PARTNER: "Partner",
};

const PLAN_PRIORITY: PlanTier[] = ["MOTOR", "CEREBRO", "PARTNER"];

export function PlanIndicator({ requiredPlan, currentPlan, className }: PlanIndicatorProps) {
  const colors = PLAN_COLORS[requiredPlan];
  const hasAccess = currentPlan
    ? PLAN_PRIORITY.indexOf(currentPlan) >= PLAN_PRIORITY.indexOf(requiredPlan)
    : false;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        colors.bg,
        colors.border,
        colors.text,
        className
      )}
    >
      {hasAccess ? (
        <CheckCircle className={cn("h-3 w-3", colors.icon)} />
      ) : (
        <Lock className={cn("h-3 w-3", colors.icon)} />
      )}
      <span>{PLAN_LABELS[requiredPlan]}</span>
    </div>
  );
}

