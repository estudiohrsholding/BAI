import { Leaf, UtensilsCrossed, Scissors, ShoppingBag, Briefcase, Zap, ShieldCheck, TrendingUp } from 'lucide-react';

export interface SoftwareApp {
  id: string;
  name: string;
  sector: string;
  description: string;
  icon: any; // Lucide Icon definition
  demoUrl: string;
  features: string[];
  gradient: string; // Para darle personalidad visual a cada tarjeta
}

export const APP_CATALOG: SoftwareApp[] = [
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
