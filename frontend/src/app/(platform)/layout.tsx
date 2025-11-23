"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { BaiAvatar } from "@/components/organisms/BaiAvatar";
import { cn } from "@/lib/utils";

interface PlatformLayoutProps {
  children: ReactNode;
}

/**
 * Platform Layout - Protected routes layout
 * Contains Sidebar and BaiAvatar for authenticated users
 * The Sidebar is fixed on the left, and content flows on the right
 */
export default function PlatformLayout({ children }: PlatformLayoutProps) {
  const pathname = usePathname();
  
  // Routes that need full-bleed layout (dark background, no padding)
  const fullWidthRoutes = ["/plans", "/checkout"];
  const isFullWidth = fullWidthRoutes.some((route) => pathname.startsWith(route));

  return (
    <div className="h-full relative">
      {/* Sidebar - Fixed on the left, hidden on mobile */}
      <Sidebar />
      
      {/* Main content area with left padding to account for sidebar */}
      <main
        className={cn(
          "h-full w-full",
          "md:pl-64", // Match sidebar width (w-64 = 256px = pl-64)
          // Full width pages: no padding, dark background
          isFullWidth
            ? "p-0 bg-slate-950 overflow-x-hidden overflow-y-auto"
            : "p-4 md:p-8 bg-gray-50 overflow-y-auto"
        )}
      >
        {children}
      </main>
      
      {/* BaiAvatar - Chat component */}
      <BaiAvatar />
    </div>
  );
}

