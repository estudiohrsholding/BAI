"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Code, DatabaseZap, ArrowRight, CheckCircle, Menu, X } from "lucide-react";

export default function MarketingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Fixed Navbar with Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-white">
              B.A.I.
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
          <div className="text-center space-y-8">
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
              No contrates software.{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Contrata un Socio.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
              Automatización, Desarrollo y Minería de Datos en una sola plataforma inteligente.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                href="/register"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
              >
                Empezar Gratis
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="px-8 py-4 rounded-lg border-2 border-slate-600 text-slate-300 font-semibold text-lg hover:border-slate-500 hover:text-white transition-all">
                Ver Demo
              </button>
            </div>

            {/* Dashboard Preview Visual */}
            <div className="pt-12 max-w-5xl mx-auto">
              <div className="relative aspect-video rounded-xl border border-slate-800 bg-slate-900 shadow-2xl shadow-blue-500/20 overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-slate-300 font-medium">Live Preview</span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-200">Dashboard Preview</p>
                    <p className="text-sm text-slate-400">Experience the B.A.I. Platform</p>
                  </div>
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: '50px 50px'
                }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition - The Trinity */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">El Ecosistema B.A.I.</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Tres servicios potentes integrados en una plataforma inteligente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Automation Card */}
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Automatización</h3>
                <p className="text-slate-400 leading-relaxed">
                  Workflows n8n que trabajan mientras duermes. Automatiza procesos repetitivos y libera tu tiempo.
                </p>
              </div>
            </div>

            {/* Software Card */}
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mb-6">
                  <Code className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Software Studio</h3>
                <p className="text-slate-400 leading-relaxed">
                  Apps a medida desplegadas en tiempo récord. Desarrollo rápido y escalable con las últimas tecnologías.
                </p>
              </div>
            </div>

            {/* Data Mining Card */}
            <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8 hover:border-green-500/50 transition-all hover:shadow-xl hover:shadow-green-500/10">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 mb-6">
                  <DatabaseZap className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Data Mining</h3>
                <p className="text-slate-400 leading-relaxed">
                  Inteligencia de mercado en tiempo real con Gemini 2.5. Descubre insights que transforman tu negocio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                  <Link href="/software" className="text-slate-400 hover:text-white transition-colors">
                    Software Studio
                  </Link>
                </li>
                <li>
                  <Link href="/data" className="text-slate-400 hover:text-white transition-colors">
                    Data Mining
                  </Link>
                </li>
                <li>
                  <Link href="/plans" className="text-slate-400 hover:text-white transition-colors">
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