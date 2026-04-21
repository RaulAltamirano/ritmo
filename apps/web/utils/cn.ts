import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases condicionales y resuelve conflictos de utilidades Tailwind
 * (p. ej. `p-2` + `p-4` → gana la última en el orden de argumentos).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
