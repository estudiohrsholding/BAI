"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/templates/DashboardShell";
import { BaiAvatar } from "@/components/organisms/BaiAvatar";

interface PlatformLayoutProps {
  children: ReactNode;
}

/**
 * Platform Layout - Protected routes layout
 * Contains Sidebar, DashboardShell, and BaiAvatar for authenticated users
 * Automatically applies isFullWidth for routes that need full-bleed design (plans, checkout)
 */
export default function PlatformLayout({ children }: PlatformLayoutProps) {
  const pathname = usePathname();
  
  // Routes that need full-bleed layout (dark background, no padding)
  const fullWidthRoutes = ["/plans", "/checkout"];
  const isFullWidth = fullWidthRoutes.some((route) => pathname.startsWith(route));

  return (
    <>
      <DashboardShell isFullWidth={isFullWidth}>{children}</DashboardShell>
      <BaiAvatar />
    </>
  );
}

