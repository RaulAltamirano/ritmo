// Tipos simplificados para BaseBadge 2025
// Enfoque minimalista y eficiente

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'subtle'

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'
export type BadgeTag = 'span' | 'button' | 'div'

export type BadgeIconPosition = 'left' | 'right'

export interface BaseBadgeProps {
  /** Variante visual del badge */
  variant?: BadgeVariant
  /** Tamaño del badge */
  size?: BadgeSize
  /** Contenido del badge */
  content?: string
  /** Contador numérico */
  count?: number
  /** Máximo valor del contador (por defecto 99) */
  maxCount?: number
  /** Icono izquierdo */
  leftIcon?: string | object
  /** Icono derecho */
  rightIcon?: string | object
  /** Estado de carga */
  loading?: boolean
  /** Hacer el badge clickeable */
  clickable?: boolean
  /** Deshabilitar el badge */
  disabled?: boolean
  /** Elemento HTML base */
  tag?: BadgeTag
  /** Label ARIA */
  ariaLabel?: string
}

/** Alias del tipo público del badge */
export type BadgeProps = BaseBadgeProps

export interface BaseBadgeEmits {
  /** Evento de click */
  click: [event: MouseEvent | KeyboardEvent]
}

export interface BaseBadgeExpose {
  /** Método para enfocar el badge */
  focus: () => void
}

// Tipos para variantes de color (internos)
export interface BadgeColorTokens {
  background: string
  text: string
  hover: string
  focus: string
  disabled: string
  count: string
}

// Mapa de colores para cada variante
export const badgeColorMap: Record<BadgeVariant, BadgeColorTokens> = {
  primary: {
    background: 'bg-blue-600',
    text: 'text-white',
    hover: 'hover:bg-blue-700',
    focus: 'focus:ring-blue-500',
    disabled: 'disabled:bg-blue-300',
    count: 'bg-blue-700',
  },
  secondary: {
    background: 'bg-gray-100',
    text: 'text-gray-700',
    hover: 'hover:bg-gray-200',
    focus: 'focus:ring-gray-500',
    disabled: 'disabled:bg-gray-50',
    count: 'bg-gray-200',
  },
  success: {
    background: 'bg-green-600',
    text: 'text-white',
    hover: 'hover:bg-green-700',
    focus: 'focus:ring-green-500',
    disabled: 'disabled:bg-green-300',
    count: 'bg-green-700',
  },
  warning: {
    background: 'bg-amber-500',
    text: 'text-white',
    hover: 'hover:bg-amber-600',
    focus: 'focus:ring-amber-400',
    disabled: 'disabled:bg-amber-300',
    count: 'bg-amber-600',
  },
  error: {
    background: 'bg-red-600',
    text: 'text-white',
    hover: 'hover:bg-red-700',
    focus: 'focus:ring-red-500',
    disabled: 'disabled:bg-red-300',
    count: 'bg-red-700',
  },
  info: {
    background: 'bg-cyan-600',
    text: 'text-white',
    hover: 'hover:bg-cyan-700',
    focus: 'focus:ring-cyan-500',
    disabled: 'disabled:bg-cyan-300',
    count: 'bg-cyan-700',
  },
  neutral: {
    background: 'bg-gray-600',
    text: 'text-white',
    hover: 'hover:bg-gray-700',
    focus: 'focus:ring-gray-500',
    disabled: 'disabled:bg-gray-400',
    count: 'bg-gray-700',
  },
  subtle: {
    background: 'bg-gray-50',
    text: 'text-gray-600',
    hover: 'hover:bg-gray-100',
    focus: 'focus:ring-gray-400',
    disabled: 'disabled:bg-gray-25',
    count: 'bg-gray-200',
  },
}

// Mapa de tamaños
export const badgeSizeMap: Record<
  BadgeSize,
  {
    padding: string
    text: string
    height: string
    minWidth: string
    borderRadius: string
  }
> = {
  xs: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    height: 'h-5',
    minWidth: 'min-w-[1.25rem]',
    borderRadius: 'rounded-md',
  },
  sm: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    height: 'h-6',
    minWidth: 'min-w-[1.5rem]',
    borderRadius: 'rounded-lg',
  },
  md: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    height: 'h-7',
    minWidth: 'min-w-[1.75rem]',
    borderRadius: 'rounded-lg',
  },
  lg: {
    padding: 'px-4 py-2',
    text: 'text-base',
    height: 'h-8',
    minWidth: 'min-w-[2rem]',
    borderRadius: 'rounded-xl',
  },
}

// Función helper para formatear contadores
export function formatBadgeCount(count: number, maxCount = 99): string {
  if (count > maxCount) {
    return `${maxCount}+`
  }

  if (count >= 1000) {
    return count >= 1000000
      ? `${(count / 1000000).toFixed(1)}M`
      : `${(count / 1000).toFixed(1)}K`
  }

  return count.toString()
}

// Función helper para validar props
export function validateBadgeProps(props: Partial<BaseBadgeProps>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validar variant
  if (props.variant && !Object.keys(badgeColorMap).includes(props.variant)) {
    errors.push(`Invalid variant: ${props.variant}`)
  }

  // Validar size
  if (props.size && !Object.keys(badgeSizeMap).includes(props.size)) {
    errors.push(`Invalid size: ${props.size}`)
  }

  // Validar count
  if (
    props.count !== undefined &&
    (typeof props.count !== 'number' || props.count < 0)
  ) {
    errors.push('Count must be a non-negative number')
  }

  // Validar maxCount
  if (
    props.maxCount !== undefined &&
    (typeof props.maxCount !== 'number' || props.maxCount < 1)
  ) {
    errors.push('MaxCount must be a positive number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Función helper para crear clases CSS
export function getBadgeClasses(
  variant: BadgeVariant,
  size: BadgeSize,
  options: {
    clickable?: boolean
    disabled?: boolean
    loading?: boolean
  } = {},
): string[] {
  const classes: string[] = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-1.5',
    'font-medium',
    'transition-all',
    'duration-200',
    'ease-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
  ]

  // Agregar clases de tamaño
  const sizeClasses = badgeSizeMap[size]
  classes.push(
    sizeClasses.padding,
    sizeClasses.text,
    sizeClasses.height,
    sizeClasses.minWidth,
    sizeClasses.borderRadius,
  )

  // Agregar clases de variante
  const colorClasses = badgeColorMap[variant]
  classes.push(
    colorClasses.background,
    colorClasses.text,
    colorClasses.hover,
    colorClasses.focus,
    colorClasses.disabled,
  )

  // Agregar clases de estado
  if (options.clickable && !options.disabled) {
    classes.push('cursor-pointer', 'active:scale-95')
  }

  if (options.disabled) {
    classes.push('opacity-50', 'cursor-not-allowed')
  }

  return classes
}
