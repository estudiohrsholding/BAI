import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "B.A.I. - Business Artificial Intelligence",
  description: "Partner-as-a-Service Platform"
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root Layout - Minimal layout with only HTML structure and global styles
 * Route groups handle their own specific layouts
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
