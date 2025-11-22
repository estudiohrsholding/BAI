import { ReactNode } from "react";

interface MarketingLayoutProps {
  children: ReactNode;
}

/**
 * Marketing Layout - Public landing page layout
 * Simple layout for marketing/public pages
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return <>{children}</>;
}

