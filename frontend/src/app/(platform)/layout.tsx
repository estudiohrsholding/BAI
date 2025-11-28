"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/organisms/Sidebar";
import { BaiAvatar } from "@/components/organisms/BaiAvatar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/providers/AppProviders";

interface PlatformLayoutProps {
  children: ReactNode;
}

export default function PlatformLayout({ children }: PlatformLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const fullWidthRoutes = ["/plans", "/checkout"];
  const isFullWidth = fullWidthRoutes.some((route) => pathname.startsWith(route));

  return (
    <AppProviders>
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-x-hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-slate-900 border-b border-slate-800 px-4 md:hidden">
          <h1 className="text-xl font-bold tracking-wide text-violet-400">B.A.I.</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Sidebar (Fijo, w-64) */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <main
          className={cn(
            "min-h-screen transition-all duration-200 ease-in-out",
            "md:ml-64", 
            "w-auto",   
            "pt-16 md:pt-0", 
            isFullWidth
              ? "p-0 bg-slate-950 overflow-y-auto"
              : "p-4 md:p-8 bg-slate-950 overflow-y-auto",
            "z-10"
          )}
        >
          {children}
        </main>
        
        <BaiAvatar />
      </div>
    </AppProviders>
  );
}
