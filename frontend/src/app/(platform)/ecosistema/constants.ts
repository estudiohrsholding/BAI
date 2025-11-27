import { Leaf, UtensilsCrossed, Scissors, ShoppingBag, Briefcase, Zap, ShieldCheck, TrendingUp, BrainCircuit, Building } from 'lucide-react';

export interface SoftwareApp {
  id: string;
  name: string;
  sector: string;
  description: string;
  icon: any; // Lucide Icon definition
  demoUrl: string;
  features: string[];
  gradient: string; // Para darle personalidad visual a cada tarjeta
  isLegendary?: boolean; // Item de rareza Mítica
}

export const APP_CATALOG: SoftwareApp[] = [
  {
    id: 'neural-core',
    name: 'B.A.I. Neural Core',
    sector: 'Inteligencia Artificial & BI',
    description: 'El cerebro central. Chatbot omnicanal con Deep Research y modelos neuronales entrenados para Business Intelligence.',
    icon: BrainCircuit,
    demoUrl: '/demos/neural-core',
    features: ['Omnicanalidad Total', 'Deep Research Agent', 'Modelo BI Enterprise'],
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    isLegendary: true
  },
  {
    id: 'real-estate-ai',
    name: 'RealEstate AI',
    sector: 'Sector Inmobiliario',
    description: 'Agente de ventas autónomo. Se integra en tu web, cualifica leads, consulta tu inventario en tiempo real y agenda visitas.',
    icon: Building,
    demoUrl: '/test-inmo.html',
    features: ['Cualificación de Leads', 'Inventario JSON/Excel', 'Agenda Automática'],
    gradient: 'from-cyan-500 to-blue-600',
    isLegendary: false
  },
  {
    id: 'cannabiapp',
    name: 'Cannabiapp',
    sector: 'Clubes Sociales (CSC)',
    description: 'Gestión integral 360°. Control de socios, dispensario y cumplimiento legal automatizado.',
    icon: Leaf,
    demoUrl: '/demos/cannabiapp',
    features: ['Registro de Socios', 'Dispensario TPV', 'Control de Accesos'],
    gradient: 'from-green-500 to-emerald-700'
  },
  {
    id: 'restaurantiapp',
    name: 'RestaurantiApp',
    sector: 'Hostelería y Restauración',
    description: 'Digitaliza tu sala y cocina. Desde la reserva online hasta la comanda en cocina.',
    icon: UtensilsCrossed,
    demoUrl: '/demos/restaurantiapp',
    features: ['Carta Digital QR', 'Motor de Reservas', 'KDS Cocina'],
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'stylebook',
    name: 'StyleBook',
    sector: 'Belleza y Estética',
    description: 'Tu agenda siempre llena. Gestión visual de citas y recordatorios por WhatsApp.',
    icon: Scissors,
    demoUrl: '/demos/stylebook',
    features: ['Agenda Visual', 'Recordatorios IA', 'Ficha Cliente'],
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 'retailflow',
    name: 'RetailFlow',
    sector: 'Retail y Comercios',
    description: 'Vende en físico y digital. Control de stock en tiempo real y fidelización de clientes.',
    icon: ShoppingBag,
    demoUrl: '/demos/retailflow',
    features: ['Inventario Cloud', 'TPV Simplificado', 'Tienda Online'],
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'bizcore',
    name: 'BizCore',
    sector: 'Servicios Profesionales',
    description: 'La oficina virtual definitiva para abogados, consultores y agencias.',
    icon: Briefcase,
    demoUrl: '/demos/bizcore',
    features: ['Gestión Documental', 'Portal Cliente', 'Citas Previas'],
    gradient: 'from-slate-700 to-slate-900'
  }
];
