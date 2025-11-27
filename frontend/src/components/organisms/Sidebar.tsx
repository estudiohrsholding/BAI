"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  Workflow,
  AppWindow,
  DatabaseZap,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemStatus } from "@/components/molecules/SystemStatus";
import { BaiLogo } from "@/components/ui/BaiLogo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Automation", href: "/automation", icon: Workflow },
  { label: "Ecosistema", href: "/ecosistema", icon: AppWindow },
  { label: "Data Mining", href: "/data-mining", icon: DatabaseZap },
  { label: "Configuración", href: "/configuracion", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove("bai_token");
    router.push("/login");
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay - Mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Fixed position, w-64, z-50 */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-50 border-r border-slate-800",
          "transform transition-transform duration-300 ease-in-out",
          // Mobile: slide in/out based on isOpen
          // Desktop: always visible (md:translate-x-0 overrides mobile state)
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header with Close Button (Mobile only) */}
          <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
            <h1>
              <BaiLogo className="text-xl" />
            </h1>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-slate-800 text-violet-400"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-violet-300",
                        "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Section with SystemStatus and Logout */}
          <div className="border-t border-slate-800 p-4 space-y-2">
            {/* System Status Component */}
            <SystemStatus />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                "transition-colors duration-200",
                "text-rose-500 hover:bg-slate-800 hover:text-rose-400",
                "focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              )}
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
