// Tokens de Tamaños - Ritmo UI 2025
// Sistema centralizado para evitar duplicación entre componentes

export const componentSizes = {
  // Tamaños de botones
  button: {
    xs: { width: 'w-16', height: 'h-8', padding: 'px-2 py-1', text: 'text-xs' },
    sm: { width: 'w-20', height: 'h-9', padding: 'px-3 py-1.5', text: 'text-sm' },
    md: { width: 'w-24', height: 'h-10', padding: 'px-4 py-2', text: 'text-sm' },
    lg: { width: 'w-28', height: 'h-11', padding: 'px-5 py-2.5', text: 'text-base' },
    xl: { width: 'w-32', height: 'h-12', padding: 'px-6 py-3', text: 'text-base' },
  },

  // Tamaños de inputs
  input: {
    xs: { width: 'w-20', height: 'h-7', padding: 'px-2 py-1', text: 'text-xs' },
    sm: { width: 'w-24', height: 'h-8', padding: 'px-3 py-1.5', text: 'text-sm' },
    md: { width: 'w-32', height: 'h-9', padding: 'px-3 py-2', text: 'text-sm' },
    lg: { width: 'w-40', height: 'h-10', padding: 'px-4 py-2.5', text: 'text-base' },
    xl: { width: 'w-48', height: 'h-11', padding: 'px-4 py-3', text: 'text-base' },
  },

  // Tamaños de badges
  badge: {
    xs: { width: 'w-4', height: 'h-4', padding: 'px-1 py-0.5', text: 'text-xs' },
    sm: { width: 'w-5', height: 'h-5', padding: 'px-2 py-1', text: 'text-xs' },
    md: { width: 'w-6', height: 'h-6', padding: 'px-2.5 py-1.5', text: 'text-sm' },
    lg: { width: 'w-8', height: 'h-8', padding: 'px-3 py-2', text: 'text-sm' },
  },

  // Tamaños de iconos
  icon: {
    xs: { width: 'w-3', height: 'h-3', size: 12 },
    sm: { width: 'w-4', height: 'h-4', size: 16 },
    md: { width: 'w-5', height: 'h-5', size: 20 },
    lg: { width: 'w-6', height: 'h-6', size: 24 },
    xl: { width: 'w-8', height: 'h-8', size: 32 },
    '2xl': { width: 'w-10', height: 'h-10', size: 40 },
  },

  // Tamaños de spinners
  spinner: {
    xs: { width: 'w-4', height: 'h-4', size: 16 },
    sm: { width: 'w-5', height: 'h-5', size: 20 },
    md: { width: 'w-6', height: 'h-6', size: 24 },
    lg: { width: 'w-8', height: 'h-8', size: 32 },
    xl: { width: 'w-10', height: 'h-10', size: 40 },
  },

  // Tamaños de skeletons
  skeleton: {
    xs: { width: 'w-16', height: 'h-2' },
    sm: { width: 'w-24', height: 'h-3' },
    md: { width: 'w-32', height: 'h-4' },
    lg: { width: 'w-40', height: 'h-6' },
    xl: { width: 'w-48', height: 'h-8' },
  },

  // Tamaños de cards
  card: {
    sm: { padding: 'p-3', rounded: 'rounded-lg' },
    md: { padding: 'p-4', rounded: 'rounded-xl' },
    lg: { padding: 'p-6', rounded: 'rounded-2xl' },
  },

  // Tamaños de modales
  modal: {
    sm: { width: 'max-w-sm', padding: 'p-4' },
    md: { width: 'max-w-lg', padding: 'p-6' },
    lg: { width: 'max-w-2xl', padding: 'p-8' },
    xl: { width: 'max-w-4xl', padding: 'p-10' },
  },

  // Tamaños de toasts
  toast: {
    sm: { width: 'max-w-xs', padding: 'p-3' },
    md: { width: 'max-w-sm', padding: 'p-4' },
    lg: { width: 'max-w-md', padding: 'p-5' },
  },

  // Tamaños de alerts
  alert: {
    sm: { padding: 'p-3', text: 'text-sm' },
    md: { padding: 'p-4', text: 'text-base' },
    lg: { padding: 'p-6', text: 'text-lg' },
  },
} as const

// Función helper para obtener tamaños de un componente específico
export function getComponentSize(component: keyof typeof componentSizes, size: string) {
  const componentSizesMap = componentSizes[component]
  if (!componentSizesMap) {
    console.warn(`Component size not found for: ${component}`)
    return componentSizesMap.md ?? {}
  }

  return (
    componentSizesMap[size as keyof typeof componentSizesMap] || componentSizesMap.md
  )
}

// Función helper para obtener todos los tamaños disponibles de un componente
export function getAvailableSizes(component: keyof typeof componentSizes): string[] {
  const componentSizesMap = componentSizes[component]
  if (!componentSizesMap) return []

  return Object.keys(componentSizesMap)
}

// Función helper para validar si un tamaño es válido para un componente
export function isValidSize(
  component: keyof typeof componentSizes,
  size: string,
): boolean {
  const availableSizes = getAvailableSizes(component)
  return availableSizes.includes(size)
}

// Función helper para obtener el tamaño por defecto de un componente
export function getDefaultSize(component: keyof typeof componentSizes): string {
  const availableSizes = getAvailableSizes(component)
  if (availableSizes.includes('md')) return 'md'
  if (availableSizes.includes('sm')) return 'sm'
  return availableSizes[0] ?? 'md'
}

// Exportar tipos para TypeScript
export type ComponentSize = keyof typeof componentSizes
export type ButtonSize = keyof typeof componentSizes.button
export type InputSize = keyof typeof componentSizes.input
export type BadgeSize = keyof typeof componentSizes.badge
export type IconSize = keyof typeof componentSizes.icon
export type SpinnerSize = keyof typeof componentSizes.spinner
export type SkeletonSize = keyof typeof componentSizes.skeleton
export type CardSize = keyof typeof componentSizes.card
export type ModalSize = keyof typeof componentSizes.modal
export type ToastSize = keyof typeof componentSizes.toast
export type AlertSize = keyof typeof componentSizes.alert
