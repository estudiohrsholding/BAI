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
    <div className={cn("flex h-screen", isFullWidth ? "bg-slate-950" : "bg-gray-50")}>
      {/* Mobile Header - Only visible on mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-slate-900 px-4 md:hidden">
        <h1 className="text-xl font-bold tracking-wide text-white">B.A.I.</h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-md p-2 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar with responsive behavior */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content area */}
      <main
        className={cn(
          "w-full flex-1 md:ml-64",
          // Full width pages: no padding, prevent horizontal scroll, relative positioning
          isFullWidth
            ? "p-0 bg-slate-950 overflow-x-hidden overflow-y-auto relative"
            : "p-8 bg-gray-50 overflow-y-auto",
          // Add top padding on mobile to account for fixed header
          "pt-20 md:pt-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
