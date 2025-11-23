"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Workflow,
  AppWindow,
  DatabaseZap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Automation (n8n)",
    href: "/automation",
    icon: Workflow,
  },
  {
    label: "Software Studio",
    href: "/software",
    icon: AppWindow,
  },
  {
    label: "Data Mining",
    href: "/data",
    icon: DatabaseZap,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col fixed left-0 top-0 z-[80] border-r border-slate-800 bg-slate-900 text-white hidden md:flex">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter text-violet-400">
          B.A.I.
        </h1>
      </div>

      {/* Navigation Container */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-violet-400"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-violet-300"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        <p>B.A.I. Systems</p>
        <p className="mt-1 text-slate-600">Partner as a Service</p>
      </div>
    </aside>
  );
}

