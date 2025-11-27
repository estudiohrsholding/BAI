"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Code,
  DatabaseZap,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Brain,
  Sparkles,
  Mic,
} from "lucide-react";
import { BaiLogo } from "@/components/ui/BaiLogo";
import { PricingTable } from "@/components/marketing/PricingTable";
import { cn } from "@/lib/utils";

const BIO_STACK = [
  {
    name: "Motor",
    alias: "El Cuerpo",
    description: "Automatiza operaciones y libera horas de equipo con flujos preconstruidos.",
    bullets: ["Workflows n8n", "Software Studio", "Playbooks operativos"],
    accent: "from-emerald-500/20 to-emerald-900/10",
    icon: Bot,
  },
  {
    name: "Cerebro",
    alias: "La Voz",
    description: "Crea contenido estratégico y libera campañas con IA supervisada.",
    bullets: ["Content Studio", "Prompts curados", "Workers creativos"],
    accent: "from-violet-500/20 to-violet-900/10",
    icon: Mic,
  },
  {
    name: "Partner",
    alias: "El Cerebro",
    description: "Data Mining continuo, squads embebidos y decisiones apoyadas en insights.",
    bullets: ["Brave Search + Gemini", "Radar competitivo", "CSM + Arquitectura"],
    accent: "from-sky-500/20 to-slate-900/10",
    icon: Brain,
  },
];

export default function MarketingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Fixed Navbar with Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <BaiLogo className="text-2xl" />
            </Link>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25"
              >
                Comenzar
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-800 py-4">
              <div className="flex flex-col gap-4 px-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-300 hover:text-white transition-colors font-medium py-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 text-center"
                >
                  Comenzar
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-10 text-center">
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
              Partner as a Service para escalar verticales.
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {" "}
                Construimos, operamos y optimizamos contigo.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              Integra el Motor (Automatización), la Voz (Creatividad) y el Cerebro (Inteligencia) en
              un solo contrato. Radical Simplicity para pasar de idea a crecimiento.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 text-left">
              {[
                { label: "Motor", copy: "Automatiza operaciones y software de canal" },
                { label: "Cerebro", copy: "IA creativa + workers asíncronos supervisados" },
                { label: "Partner", copy: "Data Mining y squads embebidos" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-slate-300"
                >
                  <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.copy}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                href="/register"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
              >
                Empezar Gratis
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/#pricing"
                className="px-8 py-4 rounded-lg border-2 border-slate-600 text-slate-300 font-semibold text-lg hover:border-slate-500 hover:text-white transition-all"
              >
                Ver Planes
              </Link>
            </div>

            {/* Promotional Video */}
            <div className="pt-12 max-w-5xl mx-auto">
              <div className="relative aspect-video rounded-xl border border-slate-800 bg-slate-900 shadow-2xl shadow-blue-500/20 overflow-hidden">
                <video
                  className="w-full h-full object-cover rounded-xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                  src="/videos/Generación_de_Video_Promocional_BAI.mp4"
                >
                  Tu navegador no soporta el tag de video.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biological Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-900/40">
        <div className="container mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
              <Sparkles className="h-3 w-3" /> Biological Stack
            </p>
            <h2 className="text-4xl font-bold text-white">Del cuerpo al cerebro.</h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              Cada plan desbloquea una capa del organismo digital. Empieza con operaciones
              automatizadas y termina con inteligencia aumentada y squads embebidos.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {BIO_STACK.map((layer) => (
              <article
                key={layer.name}
                className={cn(
                  "rounded-3xl border border-slate-800 bg-gradient-to-br p-6 text-left",
                  layer.accent,
                )}
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-300">
                  <layer.icon className="h-5 w-5 text-violet-300" />
                  {layer.alias}
                </div>
                <h3 className="mt-4 text-2xl font-bold text-white">{layer.name}</h3>
                <p className="mt-2 text-slate-300">{layer.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  {layer.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingTable />

      {/* Social Proof */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <p className="text-center text-slate-400 text-sm font-medium mb-8">
            Trusted by forward-thinking companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60">
            <span className="text-slate-500 text-lg font-semibold">TechCorp</span>
            <span className="text-slate-500 text-lg font-semibold">InnovateLabs</span>
            <span className="text-slate-500 text-lg font-semibold">FutureScale</span>
            <span className="text-slate-500 text-lg font-semibold">DataFlow</span>
            <span className="text-slate-500 text-lg font-semibold">SmartBiz</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Listo para escalar tu negocio?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Únete a las empresas que están transformando sus operaciones con B.A.I.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Crear Cuenta B.A.I.
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/automation" className="text-slate-400 hover:text-white transition-colors">
                    Automatización
                  </Link>
                </li>
                <li>
                  <Link href="/ecosistema" className="text-slate-400 hover:text-white transition-colors">
                    Ecosistema
                  </Link>
                </li>
                <li>
                  <Link href="/data" className="text-slate-400 hover:text-white transition-colors">
                    Data Mining
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-slate-400 hover:text-white transition-colors">
                    Plans & Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              © 2025 B.A.I. All rights reserved. Business Artificial Intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
