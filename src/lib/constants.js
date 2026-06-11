// Constantes compartidas entre formularios y filtros.
import {
  UtensilsCrossed,
  Laptop,
  Shirt,
  HeartPulse,
  GraduationCap,
  Wheat,
  Palette,
  Wrench,
  ShoppingCart,
  Truck,
  Plane,
  Building2,
  Sparkles,
  Clapperboard,
  LineChart,
  Package,
} from 'lucide-react'

// Las etiquetas de <option> deben ser texto plano (sin iconos/emoji).
export const RUBROS = [
  { value: 'Gastronomía', label: 'Gastronomía y Alimentos' },
  { value: 'Tecnología', label: 'Tecnología y Software' },
  { value: 'Moda', label: 'Moda y Textiles' },
  { value: 'Salud', label: 'Salud y Bienestar' },
  { value: 'Educación', label: 'Educación y Capacitación' },
  { value: 'Agricultura', label: 'Agricultura y Agroindustria' },
  { value: 'Artesanía', label: 'Artesanía y Manualidades' },
  { value: 'Servicios', label: 'Servicios Profesionales' },
  { value: 'Comercio', label: 'Comercio y Retail' },
  { value: 'Transporte', label: 'Transporte y Logística' },
  { value: 'Turismo', label: 'Turismo y Hotelería' },
  { value: 'Construcción', label: 'Construcción e Inmobiliaria' },
  { value: 'Belleza', label: 'Belleza y Cuidado Personal' },
  { value: 'Entretenimiento', label: 'Entretenimiento y Medios' },
  { value: 'Finanzas', label: 'Finanzas y Consultoría' },
  { value: 'Otro', label: 'Otro' },
]

// Icono lucide asociado a cada rubro (para tarjetas y cabeceras).
export const RUBRO_ICONS = {
  Gastronomía: UtensilsCrossed,
  Tecnología: Laptop,
  Moda: Shirt,
  Salud: HeartPulse,
  Educación: GraduationCap,
  Agricultura: Wheat,
  Artesanía: Palette,
  Servicios: Wrench,
  Comercio: ShoppingCart,
  Transporte: Truck,
  Turismo: Plane,
  Construcción: Building2,
  Belleza: Sparkles,
  Entretenimiento: Clapperboard,
  Finanzas: LineChart,
  Otro: Package,
}

export const EXPERIENCE_OPTIONS = [
  'Menos de 6 meses',
  '6 meses - 1 año',
  '1 - 2 años',
  '2 - 5 años',
  'Más de 5 años',
]

export const INVESTOR_TYPES = [
  'Ángel Inversor',
  'Fondo de Inversión',
  'Banco / Entidad Financiera',
  'Inversor Independiente',
  'Organización de Apoyo',
  'Otro',
]

export const INTEREST_SECTORS = [
  'Gastronomía',
  'Tecnología',
  'Moda',
  'Salud',
  'Educación',
  'Agricultura',
  'Todos',
]

export const EVENT_TYPES = [
  'Concurso de Startups',
  'Rueda de Negocios',
  'Webinar',
  'Capacitación',
  'Convocatoria de Incubadora',
  'Aceleradora',
  'Networking',
  'Otro',
]

export const ROLE_LABELS = {
  emprendimiento: 'Emprendimiento',
  inversor: 'Inversor',
}
