"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/organisms/Sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
  isFullWidth?: boolean;
}

/**
 * DashboardShell - Template component that provides the main dashboard layout.
 * Includes the sidebar navigation and a main content area.
 * 
 * @param isFullWidth - When true, removes padding and sets dark background for full-bleed pages
 */
export function DashboardShell({ children, isFullWidth = false }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      {/* Sidebar with responsive behavior */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content area - PADDING STRATEGY: Use padding-left for fixed sidebar */}
      {/* NOTE: This component should NOT be used inside PlatformLayout as it duplicates the sidebar */}
      {/* If used standalone, it handles its own sidebar spacing */}
      <main
        className={cn(
          "min-h-screen w-full transition-all duration-200 ease-in-out",
          // PADDING STRATEGY: Push content 64 units (16rem/256px) to the right
          // Padding is more reliable than margin for fixed sidebar layouts
          "md:pl-64",
          // MOBILE: Top padding for fixed header
          "pt-16 md:pt-0",
          // CONTENT STYLE:
          isFullWidth
            ? "p-0 bg-slate-950 overflow-y-auto"
            : "p-4 md:p-8 bg-slate-950 overflow-y-auto",
          // Prevent horizontal overflow
          "overflow-x-hidden"
        )}
      >
        {children}
      </main>
    </div>
  );
}
