import { ReactNode } from "react";

interface MarketingLayoutProps {
  children: ReactNode;
}

/**
 * Marketing Layout - Public landing page layout
 * Simple layout for marketing/public pages
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {children}
    </div>
  );
}

