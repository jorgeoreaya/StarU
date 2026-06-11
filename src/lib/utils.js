import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combina clases de Tailwind resolviendo conflictos (estándar de shadcn/ui).
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
