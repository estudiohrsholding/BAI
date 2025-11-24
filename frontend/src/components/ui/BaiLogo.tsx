import { cn } from "@/lib/utils";

interface BaiLogoProps {
  className?: string;
}

export function BaiLogo({ className }: BaiLogoProps) {
  return (
    <span
      className={cn(
        "font-extrabold tracking-wide", // Default font style
        "bg-gradient-to-r from-violet-500 via-amber-400 to-amber-600", // The Gradient
        "bg-clip-text text-transparent", // Apply gradient to text
        className
      )}
    >
      B.A.I.
    </span>
  );
}

