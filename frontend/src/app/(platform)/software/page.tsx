"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppWindow, ArrowRight, ExternalLink, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface SoftwareApp {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  logoUrl?: string;
  status: string;
  color: string;
  bgColor: string;
}

const SOFTWARE_PORTFOLIO: SoftwareApp[] = [
  {
    id: "cannabiapp",
    name: "Cannabiapp",
    description:
      "The ultimate management platform for associations and clubs. Control members, stock, and dispensing in one place.",
    url: "https://cannabiapp.com",
    logoUrl: "https://www.google.com/s2/favicons?domain=cannabiapp.com&sz=128",
    icon: Leaf,
    status: "Live",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

// Component to handle logo with fallback - extracted outside map to follow React Hooks rules
interface LogoOrIconProps {
  logoUrl?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  color: string;
  name: string;
}

function LogoOrIcon({ logoUrl, Icon, color, name }: LogoOrIconProps) {
  const [logoError, setLogoError] = useState(false);

  if (logoUrl && !logoError) {
    // Use regular img tag for external URLs with error handling
    // Next.js Image component doesn't support onError
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className="h-12 w-12 rounded-md object-contain"
        onError={() => setLogoError(true)}
        onLoad={() => setLogoError(false)}
      />
    );
  }

  if (Icon) {
    return <Icon className={cn("h-6 w-6", color)} />;
  }

  return null;
}

export default function SoftwarePage() {
  const router = useRouter();

  const handleChatRedirect = () => {
    router.push("/dashboard?action=automation_consult");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
          <AppWindow className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Software Suite</h1>
          <p className="text-sm text-gray-600">Developed Solutions & Monetized Products</p>
        </div>
      </div>

      {/* Live Apps Grid */}
      {SOFTWARE_PORTFOLIO.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Live Applications</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SOFTWARE_PORTFOLIO.map((app) => {
              return (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-gray-300"
                  )}
                >
                  {/* Logo or Icon */}
                  <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-md", app.bgColor)}>
                    <LogoOrIcon logoUrl={app.logoUrl} Icon={app.icon} color={app.color} name={app.name} />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                      <ExternalLink className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600" />
                    </div>

                    <p className="text-sm text-gray-600">{app.description}</p>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-1 text-xs font-medium", app.bgColor, app.color)}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* In Development Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">In Development</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder Card */}
          <button
            onClick={handleChatRedirect}
            className={cn(
              "group relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-left transition-all duration-200 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-gray-50 hover:shadow-md"
            )}
          >
            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <ArrowRight className="h-6 w-6 text-purple-500" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Your Custom App</h3>
              <p className="text-sm text-gray-600">Do you have an idea? Let B.A.I. build it.</p>

              {/* Call to Action */}
              <div className="flex items-center gap-2 text-sm font-medium text-purple-600 group-hover:text-purple-700">
                <span>Talk to B.A.I.</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
