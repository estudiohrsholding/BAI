import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type PlanTier = "MOTOR" | "CEREBRO" | "PARTNER";

interface PlanCard {
  tier: PlanTier;
  name: string;
  badge: string;
  price: string;
  period: string;
  tagline: string;
  description: string;
  cta: {
    label: string;
    href: string;
  };
  meta: {
    stack: string;
    value: string;
  };
  includes: string[];
  highlighted?: boolean;
}

const plans: PlanCard[] = [
  {
    tier: "MOTOR",
    name: "Motor",
    badge: "El Cuerpo",
    price: "199€",
    period: "/mes",
    tagline: "Automatización Operativa",
    description:
      "Digitaliza tus procesos críticos con flujos n8n, plantillas Next.js y acceso al Software Studio.",
    cta: { label: "Encender Motor", href: "/checkout?plan=motor" },
    meta: {
      stack: "Body",
      value: "Automations • Playbooks • Software Studio",
    },
    includes: [
      "Orquestación ilimitada en n8n",
      "Studio de Apps Verticales",
      "Workflows firmados (SLA 24h)",
      "Acceso básico al Neural Core",
      "Soporte en horario laboral",
    ],
  },
  {
    tier: "CEREBRO",
    name: "Cerebro",
    badge: "Recomendado",
    price: "499€",
    period: "/mes",
    tagline: "Voz + Inteligencia",
    description:
      "Añade creatividad asistida y reportes de mercado on-demand con Brave Search + Gemini.",
    cta: { label: "Escalar con Cerebro", href: "/checkout?plan=cerebro" },
    meta: {
      stack: "Voice + Brain",
      value: "Content Studio • IA Generativa • Data Mining",
    },
    highlighted: true,
    includes: [
      "Motor completo + librería de prompts",
      "Generación de contenidos multi-formato",
      "Procesos de Data Mining supervisados",
      "Workers asíncronos dedicados",
      "Customer Success Engineer (48h SLA)",
    ],
  },
  {
    tier: "PARTNER",
    name: "Partner",
    badge: "Enterprise",
    price: "Custom",
    period: "Plan anual",
    tagline: "Brain as a Service",
    description:
      "Gobernanza total: IP exclusiva, modelos híbridos y squads de ingeniería embebidos.",
    cta: { label: "Hablar con un Arquitecto", href: "/contacto-partner" },
    meta: {
      stack: "Full Stack",
      value: "Inteligencia continua • Integraciones privadas",
    },
    includes: [
      "Gemini + modelos propietarios",
      "Infra multi-tenant aislada",
      "Data Mesh + OTEL avanzado",
      "Playbooks de Growth co-creados",
      "CSM dedicado + war room semanal",
    ],
  },
];

const featureMatrix: Array<{
  label: string;
  description: string;
  availability: Partial<Record<PlanTier, "full" | "limited" | "custom">>;
}> = [
  {
    label: "Automation Core",
    description: "Workflows n8n + Apps de canal (WhatsApp, Web, eMail)",
    availability: { MOTOR: "full", CEREBRO: "full", PARTNER: "full" },
  },
  {
    label: "Content & Creativity",
    description: "Copys, scripts y assets orquestados por Gemini",
    availability: { MOTOR: "limited", CEREBRO: "full", PARTNER: "full" },
  },
  {
    label: "Data Mining + Brave Search",
    description: "Informes de mercado y radar competitivo",
    availability: { MOTOR: "limited", CEREBRO: "full", PARTNER: "full" },
  },
  {
    label: "AI Workers Asíncronos",
    description: "Procesos pesados con Redis + Arq",
    availability: { CEREBRO: "full", PARTNER: "full" },
  },
  {
    label: "CSM & Arquitectura Dedicada",
    description: "Planes de crecimiento co-diseñados",
    availability: { PARTNER: "full" },
  },
];

function availabilityChip(state?: "full" | "limited" | "custom") {
  if (!state) {
    return <span className="text-xs text-slate-500">Bloqueado</span>;
  }

  const mapping: Record<typeof state, { label: string; color: string }> = {
    full: { label: "Incluido", color: "bg-emerald-500/10 text-emerald-300" },
    limited: { label: "Light", color: "bg-amber-500/10 text-amber-300" },
    custom: { label: "A Medida", color: "bg-sky-500/10 text-sky-200" },
  };

  return (
    <span
      className={cn(
        "px-3 py-1 text-xs font-semibold rounded-full border border-white/10",
        mapping[state].color,
      )}
    >
      {mapping[state].label}
    </span>
  );
}

export function PricingTable() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-900/50">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="text-center space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            Partner as a Service
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Tres niveles. Un solo cerebro.
          </h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Motor arranca la operación, Cerebro acelera contenido e inteligencia y Partner integra a
            B.A.I. como tu CTO aumentado.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.tier}
              className={cn(
                "relative rounded-3xl border bg-gradient-to-br p-8 shadow-2xl transition hover:-translate-y-1",
                plan.highlighted
                  ? "border-violet-500/50 from-slate-900 via-slate-900 to-violet-950"
                  : "border-slate-800 from-slate-950 to-slate-900",
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 right-6 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold uppercase text-white">
                  Mejor inicio
                </span>
              )}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-violet-300">{plan.badge}</div>
                <div>
                  <h3 className="text-3xl font-bold text-white">{plan.name}</h3>
                  <p className="text-slate-400">{plan.tagline}</p>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 font-medium">{plan.period}</span>
                </div>
                <p className="text-slate-300">{plan.description}</p>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <p className="font-semibold uppercase tracking-widest text-xs text-slate-400">
                    Biological Stack
                  </p>
                  <p className="text-white">{plan.meta.stack}</p>
                  <p className="text-slate-400">{plan.meta.value}</p>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className={cn(
                  "mt-8 flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-center text-base font-semibold transition",
                  plan.highlighted
                    ? "bg-white text-slate-900 hover:bg-slate-200"
                    : "border border-slate-700 text-white hover:border-slate-500",
                )}
              >
                {plan.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-2xl">
          <div className="grid gap-6 md:grid-cols-[220px_1fr_1fr_1fr] text-sm">
            <div className="text-xs uppercase tracking-widest text-slate-500">Comparativa</div>
            {plans.map((plan) => (
              <div key={plan.tier} className="text-center text-slate-300 font-semibold">
                {plan.name}
              </div>
            ))}
            {featureMatrix.map((row) => (
              <div
                key={row.label}
                className="contents border-t border-slate-800 py-4 first:pt-0 first:border-none"
              >
                <div className="space-y-1 text-slate-300">
                  <p className="font-semibold">{row.label}</p>
                  <p className="text-xs text-slate-500">{row.description}</p>
                </div>
                {plans.map((plan) => (
                  <div key={`${row.label}-${plan.tier}`} className="flex justify-center">
                    {availabilityChip(row.availability[plan.tier])}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

