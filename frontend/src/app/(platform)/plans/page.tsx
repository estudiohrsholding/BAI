"use client";

import { PricingSection } from "@/components/sections/PricingSection";

export default function PlansPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Dark Background with Spotlight Effect */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(139,92,246,0.1),transparent_50%)]" />
      </div>

      <PricingSection />
    </div>
  );
}
