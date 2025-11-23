// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Debes crear este componente
import { Sidebar } from "@/components/Sidebar"; // Asumo que el Sidebar ya existe

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B.A.I.",
  description: "Partner as a Service",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Nota: suppressHydrationWarning es necesario para Next/Shadcn Theme
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Paso 1: Usamos ThemeProvider para el manejo de temas (Dark/Cyberpunk) */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system" // Por defecto, usa la preferencia del sistema
          enableSystem
          disableTransitionOnChange
        >
          {/* Paso 2: Creamos la estructura de 2 columnas (grid-cols-[auto,1fr]) */}
          {/* 'auto' para el Sidebar (ancho fijo) y '1fr' para el contenido (el resto) */}
          <div className="grid grid-cols-[auto,1fr] h-screen overflow-hidden">
            
            {/* Columna 1: Sidebar fijo */}
            <Sidebar /> 
            
            {/* Columna 2: Contenido principal (con scroll vertical) */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
          </div>
          
        </ThemeProvider>
      </body>
    </html>
  );
}