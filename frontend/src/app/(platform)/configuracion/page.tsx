"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Link as LinkIcon,
  Calendar,
  Mic,
  DatabaseZap,
  Activity,
  Save,
  Key,
  Sparkles,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  apiGet,
  ApiError,
  createCampaign,
  getCampaigns,
  CampaignCreateRequest,
  MarketingCampaignListItemResponse,
  launchMonthlyCampaign,
  getMonthlyCampaigns,
  ContentCampaignCreateRequest,
  ContentCampaignResponse,
} from "@/lib/api-client";
import { FeatureGate, PlanTier } from "@/components/common/FeatureGate";
import { PlanIndicator } from "@/components/common/PlanIndicator";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { CampaignStatusList } from "@/components/content_creator/CampaignStatusList";
import { CampaignStatusTracker } from "@/components/content_planner/CampaignStatusTracker";
import { CampaignResultViewer } from "@/components/content_planner/CampaignResultViewer";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  plan_tier: string;
  role?: string;
  is_active: boolean;
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>("MOTOR");

  // Form state for MOTOR (Basic)
  const [webUrl, setWebUrl] = useState("");
  const [messengerToken, setMessengerToken] = useState("");
  const [instagramToken, setInstagramToken] = useState("");
  const [calendarSync, setCalendarSync] = useState(false);

  // Form state for CEREBRO (Strategy)
  const [aiTone, setAiTone] = useState("profesional");
  const [contentRules, setContentRules] = useState("");
  const [publishingLimits, setPublishingLimits] = useState("5");
  const [miningFrequency, setMiningFrequency] = useState("monthly");

  // Form state for CEREBRO (Content Planner - Monthly Campaign)
  const [campaignMonth, setCampaignMonth] = useState("");
  const [campaignTone, setCampaignTone] = useState("profesional");
  const [campaignThemes, setCampaignThemes] = useState("");
  const [selectedCampaignPlatforms, setSelectedCampaignPlatforms] = useState<string[]>([]);
  const [isLaunchingCampaign, setIsLaunchingCampaign] = useState(false);
  const [monthlyCampaigns, setMonthlyCampaigns] = useState<any[]>([]);
  const [isLoadingMonthlyCampaigns, setIsLoadingMonthlyCampaigns] = useState(false);
  const [viewingCampaignId, setViewingCampaignId] = useState<number | null>(null);

  // Form state for PARTNER (Content Creator)
  const [campaignName, setCampaignName] = useState("");
  const [influencerName, setInfluencerName] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("profesional");
  const [campaignTopic, setCampaignTopic] = useState("");  // Tema/contexto de la campaña
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [contentCount, setContentCount] = useState(10);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaigns, setCampaigns] = useState<MarketingCampaignListItemResponse[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await apiGet<User>("/api/auth/me");
        setUser(profile);
        const normalized = (profile.plan_tier?.toUpperCase() || "MOTOR") as PlanTier;
        setCurrentPlan(normalized);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.push("/login");
        } else {
          console.error("Error loading user data:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Cargar campañas si el usuario es PARTNER
  useEffect(() => {
    if (currentPlan === "PARTNER" && user) {
      loadCampaigns();
      // Auto-refresh cada 10 segundos para actualizar estados
      const interval = setInterval(loadCampaigns, 10000);
      return () => clearInterval(interval);
    }
  }, [currentPlan, user]);

  // Cargar campañas mensuales si el usuario es CEREBRO
  useEffect(() => {
    if (currentPlan === "CEREBRO" && user) {
      loadMonthlyCampaigns();
      // Auto-refresh cada 10 segundos para actualizar estados
      const interval = setInterval(loadMonthlyCampaigns, 10000);
      return () => clearInterval(interval);
    }
  }, [currentPlan, user]);

  const loadCampaigns = async () => {
    if (currentPlan !== "PARTNER") return;
    
    try {
      setIsLoadingCampaigns(true);
      const response = await getCampaigns(50, 0);
      setCampaigns(response.campaigns);
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        console.error("Error cargando campañas:", error);
      }
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const handleSaveBasic = async () => {
    // TODO: Implementar guardado de configuración básica
    console.log("Guardando configuración básica:", {
      webUrl,
      messengerToken,
      instagramToken,
      calendarSync,
    });
  };

  const handleSaveStrategy = async () => {
    // TODO: Implementar guardado de configuración de estrategia
    console.log("Guardando estrategia:", {
      aiTone,
      contentRules,
      publishingLimits,
      miningFrequency,
    });
  };

  const handleCreateCampaign = async () => {
    if (!campaignName || !influencerName || !campaignTopic.trim() || selectedPlatforms.length === 0) {
      alert("Por favor completa todos los campos requeridos, incluyendo el tema de la campaña");
      return;
    }

    try {
      setIsCreatingCampaign(true);
      const campaignData: CampaignCreateRequest = {
        name: campaignName,
        influencer_name: influencerName,
        tone_of_voice: toneOfVoice,
        topic: campaignTopic.trim(),  // Tema/contexto de la campaña
        platforms: selectedPlatforms,
        content_count: contentCount,
        scheduled_at: null, // Por ahora, iniciar inmediatamente
      };

      await createCampaign(campaignData);
      
      // Limpiar formulario
      setCampaignName("");
      setInfluencerName("");
      setToneOfVoice("profesional");
      setCampaignTopic("");
      setSelectedPlatforms([]);
      setContentCount(10);
      
      // Recargar lista de campañas
      await loadCampaigns();
      
      alert("Campaña creada exitosamente. El contenido se está generando en segundo plano.");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 402) {
          // Payment Required - Créditos insuficientes
          alert(`Créditos insuficientes: ${error.message}\n\nPor favor, compra créditos adicionales o espera a que se renueven tus créditos mensuales.`);
        } else if (error.status === 403) {
          alert("Esta funcionalidad requiere el plan CEREBRO o superior. Actualiza tu suscripción.");
        } else {
          alert(`Error al crear campaña: ${error.message}`);
        }
      } else {
        alert("Error inesperado al crear la campaña");
      }
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleCampaignPlatform = (platform: string) => {
    setSelectedCampaignPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const loadMonthlyCampaigns = async () => {
    if (currentPlan !== "CEREBRO") return;
    
    try {
      setIsLoadingMonthlyCampaigns(true);
      const response = await getMonthlyCampaigns(50, 0);
      setMonthlyCampaigns(response.campaigns);
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        console.error("Error cargando campañas mensuales:", error);
      }
    } finally {
      setIsLoadingMonthlyCampaigns(false);
    }
  };

  const handleLaunchMonthlyCampaign = async () => {
    if (!campaignMonth || !campaignThemes.trim() || selectedCampaignPlatforms.length === 0) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Validar formato de mes (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(campaignMonth)) {
      alert("El formato del mes debe ser YYYY-MM (ej: 2025-02)");
      return;
    }

    try {
      setIsLaunchingCampaign(true);
      const campaignData: ContentCampaignCreateRequest = {
        month: campaignMonth,
        tone_of_voice: campaignTone,
        themes: campaignThemes.split(",").map((t) => t.trim()).filter((t) => t.length > 0),
        target_platforms: selectedCampaignPlatforms,
        campaign_metadata: {
          content_rules: contentRules,
          publishing_limits: parseInt(publishingLimits) || 5,
        },
        scheduled_at: null, // Por ahora, iniciar inmediatamente
      };

      await launchMonthlyCampaign(campaignData);
      
      // Limpiar formulario
      setCampaignMonth("");
      setCampaignTone("profesional");
      setCampaignThemes("");
      setSelectedCampaignPlatforms([]);
      
      // Recargar lista de campañas
      await loadMonthlyCampaigns();
      
      alert("Campaña mensual lanzada exitosamente. Se generarán 4 Posts + 1 Reel en segundo plano.");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          alert("Esta funcionalidad requiere el plan CEREBRO. Actualiza tu suscripción.");
        } else {
          alert(`Error al lanzar campaña: ${error.message}`);
        }
      } else {
        alert("Error inesperado al lanzar la campaña");
      }
    } finally {
      setIsLaunchingCampaign(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "text-slate-400 bg-slate-500/20 border-slate-500/30",
      in_progress: "text-amber-400 bg-amber-500/20 border-amber-500/30",
      completed: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      failed: "text-red-400 bg-red-500/20 border-red-500/30",
      cancelled: "text-slate-500 bg-slate-600/20 border-slate-600/30",
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      in_progress: "En Progreso",
      completed: "Completada",
      failed: "Fallida",
      cancelled: "Cancelada",
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
            <Settings className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Configuración Maestra</h1>
            <p className="text-sm text-slate-400">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
            <Settings className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Configuración Maestra</h1>
            <p className="text-sm text-slate-400">
              Gestiona todos los ajustes de tu plataforma según tu plan
            </p>
          </div>
        </div>
        {user && <PlanIndicator requiredPlan={currentPlan} currentPlan={currentPlan} />}
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="operaciones">
        <TabsList>
          <TabsTrigger value="operaciones" icon={LinkIcon}>
            Operaciones Básicas
          </TabsTrigger>
          <TabsTrigger value="estrategia" icon={Mic}>
            Inteligencia Estratégica
          </TabsTrigger>
          <TabsTrigger value="datos" icon={DatabaseZap}>
            Núcleo de Datos
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Operaciones Básicas (MOTOR) - Always Visible */}
        <TabsContent value="operaciones">
          <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900/50 p-6 shadow-lg backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Conexiones Esenciales</h2>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 text-xs font-medium text-emerald-400">
                Plan Motor
              </span>
            </div>
            <p className="mb-6 text-sm text-slate-400">
              Configura las URLs y tokens necesarios para operaciones básicas y flujos de mensajería.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  URL de tu Web/App
                </label>
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://tu-dominio.com"
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  URL donde se embederá el widget de chat o automatizaciones
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Token de Mensajería (WhatsApp/Messenger)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={messengerToken}
                    onChange={(e) => setMessengerToken(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <Button variant="outline" size="md" onClick={() => setMessengerToken("")}>
                    Limpiar
                  </Button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Token para conectar con servicios de mensajería (WhatsApp Business API, etc.)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Token de Instagram (Opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={instagramToken}
                    onChange={(e) => setInstagramToken(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <Button variant="outline" size="md" onClick={() => setInstagramToken("")}>
                    Limpiar
                  </Button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Token para automatizar publicaciones en Instagram
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sincronización de Calendario
                </label>
                <div className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">Google Calendar Sync</p>
                    <p className="text-xs text-slate-400">
                      Sincroniza eventos y citas automáticamente
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={calendarSync}
                    onChange={(e) => setCalendarSync(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleSaveBasic}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar Configuración Básica
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Inteligencia Estratégica (CEREBRO) - Gated */}
        <TabsContent value="estrategia">
          <FeatureGate
            requiredPlan="CEREBRO"
            currentPlan={currentPlan}
            title="Inteligencia Estratégica"
            description="Control fino sobre la agencia de marketing IA y reglas de Data Mining."
          >
            <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6 shadow-lg backdrop-blur">
              <div className="mb-4 flex items-center gap-2">
                <Mic className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Ajustes de Marketing IA</h2>
                <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-1 text-xs font-medium text-violet-400">
                  Plan Cerebro
                </span>
              </div>
              <p className="mb-6 text-sm text-slate-400">
                Configura el tono de voz de la IA, reglas de publicación y límites de contenido.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tono de Voz de la IA
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="profesional">Profesional</option>
                    <option value="amigable">Amigable</option>
                    <option value="técnico">Técnico</option>
                    <option value="creativo">Creativo</option>
                    <option value="empresarial">Empresarial</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Define cómo debe comunicarse la IA en tus campañas y contenido
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Reglas de Publicación
                  </label>
                  <textarea
                    value={contentRules}
                    onChange={(e) => setContentRules(e.target.value)}
                    placeholder="Ej: No mencionar competidores. Enfocarse en beneficios del cliente. Usar emojis moderadamente."
                    rows={4}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Reglas específicas que la IA debe seguir al generar y publicar contenido
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Límites de Publicación Diaria
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={publishingLimits}
                    onChange={(e) => setPublishingLimits(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Número máximo de publicaciones automáticas por día
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Frecuencia de Data Mining
                  </label>
                  <select
                    value={miningFrequency}
                    onChange={(e) => setMiningFrequency(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Con qué frecuencia generar reportes de análisis de mercado
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveStrategy}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar Estrategia
                </Button>
              </div>
            </div>

            {/* Planificador de Contenido Mensual */}
            <div className="mt-8 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6 shadow-lg backdrop-blur">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Planificador de Contenido Mensual</h2>
                <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-1 text-xs font-medium text-violet-400">
                  Plan Cerebro
                </span>
              </div>
              <p className="mb-6 text-sm text-slate-400">
                Programa tu contenido mensual: 4 Posts + 1 Reel generados automáticamente por IA.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mes de la Campaña *
                    </label>
                    <input
                      type="text"
                      value={campaignMonth}
                      onChange={(e) => setCampaignMonth(e.target.value)}
                      placeholder="2025-02"
                      pattern="\d{4}-\d{2}"
                      className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Formato: YYYY-MM (ej: 2025-02 para febrero 2025)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tono de Voz *
                    </label>
                    <select
                      value={campaignTone}
                      onChange={(e) => setCampaignTone(e.target.value)}
                      className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="profesional">Profesional</option>
                      <option value="amigable">Amigable</option>
                      <option value="técnico">Técnico</option>
                      <option value="creativo">Creativo</option>
                      <option value="empresarial">Empresarial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Temas o Keywords *
                  </label>
                  <input
                    type="text"
                    value={campaignThemes}
                    onChange={(e) => setCampaignThemes(e.target.value)}
                    placeholder="IA, Marketing Digital, Innovación (separados por comas)"
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Separa los temas con comas. Se usarán para generar el contenido y como hashtags.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Plataformas de Destino *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Instagram", "Facebook", "LinkedIn", "Twitter"].map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => toggleCampaignPlatform(platform)}
                        className={cn(
                          "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                          selectedCampaignPlatforms.includes(platform)
                            ? "border-violet-500 bg-violet-500/20 text-violet-400"
                            : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                        )}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Selecciona al menos una plataforma donde se publicará el contenido
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleLaunchMonthlyCampaign}
                  disabled={isLaunchingCampaign || !campaignMonth || !campaignThemes.trim() || selectedCampaignPlatforms.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                >
                  {isLaunchingCampaign ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      Lanzando Campaña...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Lanzar Campaña Mensual (4 Posts + 1 Reel)
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Lista de Campañas Mensuales */}
            <div className="mt-6 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-6 shadow-lg backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-violet-400" />
                  <h2 className="text-lg font-semibold text-white">Mis Campañas Mensuales</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMonthlyCampaigns}
                  disabled={isLoadingMonthlyCampaigns}
                >
                  {isLoadingMonthlyCampaigns ? "Cargando..." : "Actualizar"}
                </Button>
              </div>

              {isLoadingMonthlyCampaigns && monthlyCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Cargando campañas...</p>
                </div>
              ) : monthlyCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-violet-400/50 mx-auto mb-4" />
                  <p className="text-sm text-slate-400">
                    No tienes campañas mensuales aún. Lanza tu primera campaña arriba.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {monthlyCampaigns.map((campaign) => {
                    // Debug: Log campaign data
                    console.log('Campaign Data:', {
                      id: campaign.id,
                      status: campaign.status,
                      hasGeneratedContent: !!campaign.generated_content,
                      generatedContentKeys: campaign.generated_content ? Object.keys(campaign.generated_content) : [],
                      generatedContent: campaign.generated_content
                    });

                    // Condición muy permisiva para mostrar el botón
                    const shouldShowButton = campaign.generated_content || 
                                            (campaign.status && campaign.status.toLowerCase().includes('complete'));

                    return (
                    <div
                      key={campaign.id}
                      className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-900/70 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-white">
                              Campaña {campaign.month}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Botón "Ver Resultados" - Visible siempre que haya contenido */}
                          {shouldShowButton && (
                            <button
                              onClick={() => setViewingCampaignId(campaign.id)}
                              className="flex items-center gap-1.5 rounded-md border-2 border-violet-500 bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 hover:border-violet-400 transition-all shadow-lg shadow-violet-500/20 whitespace-nowrap"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver Resultados
                            </button>
                          )}
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-xs font-medium",
                              getStatusColor(campaign.status)
                            )}
                          >
                            {getStatusLabel(campaign.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">
                          Tono: <span className="text-slate-300">{campaign.tone_of_voice}</span> | 
                          Temas: <span className="text-slate-300">{campaign.themes.join(", ")}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span>
                          Plataformas: {campaign.target_platforms.join(", ")}
                        </span>
                      </div>

                      {/* Status Tracker Component (Polling cada 5 segundos) */}
                      {campaign.arq_job_id && (
                        <div className="mb-3">
                          <CampaignStatusTracker
                            campaignId={campaign.id}
                            campaignMonth={campaign.month}
                            campaign={campaign}
                            onStatusUpdate={(status) => {
                              // Actualizar estado local si el job cambió
                              if (status.campaign_status !== campaign.status) {
                                // Recargar lista para sincronizar con DB
                                loadMonthlyCampaigns();
                              }
                            }}
                          />
                        </div>
                      )}

                      {campaign.generated_content && (
                        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 mb-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-emerald-400 mb-2">
                                ✓ Contenido Generado
                              </p>
                              <div className="space-y-1 text-xs text-slate-300">
                                <div>
                                  <span className="text-slate-400">Posts:</span>{" "}
                                  {campaign.generated_content.posts?.length || 0} piezas
                                </div>
                                <div>
                                  <span className="text-slate-400">Reel:</span>{" "}
                                  {campaign.generated_content.reel ? "1 pieza" : "0 piezas"}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setViewingCampaignId(campaign.id)}
                              className="ml-4 flex items-center gap-1.5 rounded-md border-2 border-violet-500 bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 hover:border-violet-400 transition-all shadow-lg shadow-violet-500/20 whitespace-nowrap"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver Resultados
                            </button>
                          </div>
                        </div>
                      )}

                      {campaign.error_message && (
                        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
                          <p className="text-xs font-medium text-red-400">
                            Error: {campaign.error_message}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Creada: {new Date(campaign.created_at).toLocaleDateString("es-ES")}
                        </span>
                        {campaign.completed_at && (
                          <span>
                            Completada: {new Date(campaign.completed_at).toLocaleDateString("es-ES")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}

              {/* Result Viewer Modal */}
              {viewingCampaignId && (
                <CampaignResultViewer
                  campaign={monthlyCampaigns.find((c) => c.id === viewingCampaignId)!}
                  open={viewingCampaignId !== null}
                  onOpenChange={(open) => {
                    if (!open) setViewingCampaignId(null);
                  }}
                />
              )}
            </div>
          </FeatureGate>
        </TabsContent>

        {/* Tab 3: Núcleo de Datos y Desarrollo (PARTNER) - Highest Gate */}
        <TabsContent value="datos">
          <FeatureGate
            requiredPlan="PARTNER"
            currentPlan={currentPlan}
            title="AI Influencer Creator"
            description="Crea y programa campañas de contenido generado por IA para influencers virtuales."
          >
            <div className="space-y-6">
              {/* Formulario de Creación de Campaña */}
              <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-6 shadow-lg backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-white">Crear Nueva Campaña</h2>
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-xs font-medium text-amber-400">
                    Plan Partner
                  </span>
                </div>
                <p className="mb-6 text-sm text-slate-400">
                  Define una campaña de contenido para tu influencer IA. El contenido se generará
                  automáticamente usando DALL-E 3, HeyGen y Gemini.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nombre de la Campaña *
                      </label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Ej: Campaña Q1 2025"
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nombre del Influencer IA *
                      </label>
                      <input
                        type="text"
                        value={influencerName}
                        onChange={(e) => setInfluencerName(e.target.value)}
                        placeholder="Ej: TechGuru_AI"
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tono de Voz *
                    </label>
                    <select
                      value={toneOfVoice}
                      onChange={(e) => setToneOfVoice(e.target.value)}
                      className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="profesional">Profesional</option>
                      <option value="casual">Casual</option>
                      <option value="humorístico">Humorístico</option>
                      <option value="inspiracional">Inspiracional</option>
                      <option value="técnico">Técnico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tema o Contexto de la Campaña *
                    </label>
                    <textarea
                      value={campaignTopic}
                      onChange={(e) => setCampaignTopic(e.target.value)}
                      placeholder="Ej: Promocionar las nuevas zapatillas de running para verano, destacando su tecnología de amortiguación y diseño sostenible..."
                      rows={4}
                      className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Describe el tema, mensaje o contexto sobre el cual la IA debe generar el contenido. Este campo es esencial para que la generación sea relevante y útil.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Plataformas de Destino *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["Instagram", "TikTok", "YouTube", "Twitter"].map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          className={cn(
                            "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                            selectedPlatforms.includes(platform)
                              ? "border-amber-500 bg-amber-500/20 text-amber-400"
                              : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Selecciona al menos una plataforma donde se publicará el contenido
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Número de Piezas de Contenido
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={contentCount}
                      onChange={(e) => setContentCount(parseInt(e.target.value) || 10)}
                      className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Tiempo estimado: {contentCount * 15} segundos (15 segundos por pieza)
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCreateCampaign}
                    disabled={isCreatingCampaign || !campaignName || !influencerName || !campaignTopic.trim() || selectedPlatforms.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                  >
                    {isCreatingCampaign ? (
                      <>
                        <Activity className="h-4 w-4 animate-spin" />
                        Creando Campaña...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Crear y Programar Campaña
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Lista de Campañas */}
              <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-6 shadow-lg backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-400" />
                    <h2 className="text-lg font-semibold text-white">Mis Campañas</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadCampaigns}
                    disabled={isLoadingCampaigns}
                  >
                    {isLoadingCampaigns ? "Cargando..." : "Actualizar"}
                  </Button>
                </div>

                {isLoadingCampaigns && campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Cargando campañas...</p>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-amber-400/50 mx-auto mb-4" />
                    <p className="text-sm text-slate-400">
                      No tienes campañas aún. Crea tu primera campaña arriba.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-900/70 transition-colors"
                      >
                        {/* Header con nombre y estado básico */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-white">
                                {campaign.name}
                              </h3>
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-xs font-medium",
                                  getStatusColor(campaign.status)
                                )}
                              >
                                {getStatusLabel(campaign.status)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400">
                              Influencer: <span className="text-slate-300">{campaign.influencer_name}</span> | Tono:{" "}
                              <span className="text-slate-300">{campaign.tone_of_voice}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Botón "Ver Resultados" - Visible si hay piezas completadas */}
                            {(campaign.total_pieces_count > 0 || campaign.status === "completed" || campaign.status === "in_progress") && (
                              <button
                                onClick={() => router.push(`/marketing/campaigns/${campaign.id}`)}
                                className="flex items-center gap-1.5 rounded-md border-2 border-amber-500 bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 hover:border-amber-400 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {campaign.completed_pieces_count > 0 ? `Ver Resultados (${campaign.completed_pieces_count}/${campaign.total_pieces_count})` : "Ver Campaña"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar basado en piezas completadas */}
                        {campaign.total_pieces_count > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-400">Progreso de Generación</span>
                              <span className="text-xs font-medium text-slate-300">
                                {campaign.completed_pieces_count}/{campaign.total_pieces_count}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  campaign.completed_pieces_count === campaign.total_pieces_count
                                    ? "bg-emerald-500"
                                    : "bg-gradient-to-r from-amber-500 to-yellow-500"
                                )}
                                style={{ width: `${(campaign.completed_pieces_count / campaign.total_pieces_count) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Mensaje de progreso */}
                        {campaign.status === "in_progress" && campaign.total_pieces_count === 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-slate-400">
                              ⏳ Generando plan de contenido... Esto puede tardar unos minutos.
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>
                            Creada: {new Date(campaign.created_at).toLocaleDateString("es-ES")}
                          </span>
                          {campaign.completed_at && (
                            <span>
                              Completada: {new Date(campaign.completed_at).toLocaleDateString("es-ES")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FeatureGate>
        </TabsContent>
      </Tabs>

      {/* Info Footer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-xs text-slate-400 text-center">
          Las configuraciones se guardan automáticamente. Para más opciones,{" "}
          <Link href="/#pricing" className="text-violet-400 hover:text-violet-300 underline">
            actualiza tu plan
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
