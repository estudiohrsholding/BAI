"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { LayoutDashboard, Workflow, Code, BrainCircuit, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemStatus } from "@/components/molecules/SystemStatus";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Automation", href: "/automation", icon: Workflow },
  { label: "Software Dev", href: "/software", icon: Code },
  { label: "Data Mining", href: "/data", icon: BrainCircuit },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // Remove authentication token cookie
    Cookies.remove("bai_token");
    // Redirect to login page
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white">
      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="flex h-16 items-center justify-center border-b border-slate-800 px-4">
          <h1 className="text-xl font-bold tracking-wide">B.A.I.</h1>
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
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      "transition-colors duration-200",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-800 hover:text-white",
                      "focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-900"
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

        {/* Footer Section */}
        <div className="border-t border-slate-800 p-4 space-y-2">
          {/* System Status */}
          <SystemStatus />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
              "transition-colors duration-200",
              "text-red-400 hover:bg-slate-800 hover:text-red-300",
              "focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-900"
            )}
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
