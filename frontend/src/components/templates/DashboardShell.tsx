import { ReactNode } from "react";
import { Sidebar } from "@/components/organisms/Sidebar";
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
  return (
    <div className={cn("flex h-screen", isFullWidth ? "bg-slate-950" : "bg-gray-50")}>
      <Sidebar />
      <main
        className={cn(
          "ml-64 flex-1 overflow-y-auto",
          isFullWidth ? "p-0 bg-slate-950" : "p-8 bg-gray-50"
        )}
      >
        {children}
      </main>
    </div>
  );
}
