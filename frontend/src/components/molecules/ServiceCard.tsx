import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";

export interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: "Active" | "Inactive" | "Beta";
  buttonText: string;
  actionUrl?: string;
}

const statusStyles: Record<NonNullable<ServiceCardProps["status"]>, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Inactive: "bg-gray-100 text-gray-600 border-gray-200",
  Beta: "bg-amber-100 text-amber-700 border-amber-200"
};

export function ServiceCard({ title, description, icon: Icon, status, buttonText, actionUrl }: ServiceCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
        "transition-all duration-200",
        "hover:shadow-md"
      )}
    >
      {/* Header: Icon + Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {/* Body: Description */}
      <p className="mb-6 text-sm text-gray-600">{description}</p>

      {/* Footer: Status Badge + Button */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            statusStyles[status]
          )}
        >
          {status}
        </span>
        {actionUrl ? (
          <Link href={actionUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              {buttonText}
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm">
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}
