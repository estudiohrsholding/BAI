"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/organisms/Sidebar";
import { BaiAvatar } from "@/components/organisms/BaiAvatar";
import { Menu } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Routes that need full-bleed layout (dark background, no padding)
  const fullWidthRoutes = ["/plans", "/checkout"];
  const isFullWidth = fullWidthRoutes.some((route) => pathname.startsWith(route));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-x-hidden">
      {/* Mobile Header - Only visible on mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-slate-900 border-b border-slate-800 px-4 md:hidden">
        <h1 className="text-xl font-bold tracking-wide text-violet-400">B.A.I.</h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar - Fixed on the left, hidden on mobile */}
      {/* SIDEBAR_WIDTH = w-64 (256px), z-50 */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content area - MUST match sidebar width with padding */}
      {/* CRITICAL: md:pl-64 MUST match md:w-64 from sidebar */}
      <main
        className={cn(
          "min-h-screen w-full overflow-x-hidden",
          "md:pl-64", // EXACTLY matches sidebar width: w-64 = 256px = pl-64
          // Full width pages: no padding, dark background
          isFullWidth
            ? "p-0 bg-slate-950 overflow-y-auto"
            : "p-4 md:p-8 bg-slate-950 overflow-y-auto",
          // Add top padding on mobile to account for fixed header
          "pt-16 md:pt-0"
        )}
      >
        {children}
      </main>
      
      {/* BaiAvatar - Chat component (fixed position handled by component) */}
      <BaiAvatar />
    </div>
  );
}
