// Iconos y metadatos por rol, reutilizables en toda la app.
import { Rocket, Briefcase } from 'lucide-react'
import { RUBRO_ICONS } from './constants'

export const ROLE_ICONS = {
  emprendimiento: Rocket,
  inversor: Briefcase,
}

export function getRubroIcon(rubro) {
  return RUBRO_ICONS[rubro] ?? null
}

export function getRoleIcon(role) {
  return ROLE_ICONS[role] ?? null
}
