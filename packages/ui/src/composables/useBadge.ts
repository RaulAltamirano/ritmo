// Composable para manejo de badges - Ritmo UI 2025
// Implementa la lógica que falta en BaseBadge.vue

import { computed, ref, readonly } from 'vue'
import type { Component } from 'vue'
import type { BadgeVariant, BadgeSize, BadgeIconPosition } from '../types/badge'
import {
  formatBadgeCount,
  getBadgeCountClasses,
  getBadgeVariantClasses,
} from '../types/badge'

export interface BadgeOptions {
  variant: BadgeVariant
  size: BadgeSize
  icon?: Component
  iconPosition: BadgeIconPosition
  content?: string
  count?: number
  loading: boolean
  showContentWhileLoading: boolean
  clickable: boolean
  disabled: boolean
  role?: string
  ariaLabel?: string
}

export function useBadge(options: BadgeOptions) {
  const {
    variant,
    size,
    icon,
    content,
    count,
    loading,
    showContentWhileLoading,
    clickable,
    disabled,
    role,
    ariaLabel,
  } = options

  // Estado interno
  const isPressed = ref(false)

  // Estado del badge
  const badgeState = computed(() => ({
    isPressed: isPressed.value,
    isLoading: loading,
    isDisabled: disabled,
    isClickable: clickable,
    hasIcon: !!icon,
    hasCount: count !== undefined && count > 0,
    shouldShowContent: !loading || showContentWhileLoading,
  }))

  // Clases de tamaño
  const sizeClasses = computed(
    () =>
      ({
        xs: 'px-2 py-0.5 text-xs min-w-[1.5rem] h-5',
        sm: 'px-2.5 py-1 text-sm min-w-[2rem] h-6',
        md: 'px-3 py-1.5 text-sm min-w-[2.5rem] h-7',
        lg: 'px-4 py-2 text-base min-w-[3rem] h-8',
      })[size],
  )

  const variantClasses = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all'
    const soft = getBadgeVariantClasses(variant, 'soft').join(' ')
    return `${base} ${soft}`
  })

  const countClasses = computed(() => getBadgeCountClasses(variant, 'soft'))

  // Rol ARIA computado
  const computedRole = computed(() => {
    if (role) return role
    if (clickable) return 'button'
    if (loading) return 'status'
    return undefined
  })

  // Label ARIA computado
  const computedAriaLabel = computed(() => {
    if (ariaLabel) return ariaLabel

    let label = content ?? 'Badge'
    if (count !== undefined && count > 0) {
      label += ` con ${count} elementos`
    }
    if (loading) {
      label += ' cargando'
    }
    if (disabled) {
      label += ' deshabilitado'
    }

    return label
  })

  // Aria pressed computado
  const computedAriaPressed = computed(() => {
    if (clickable && !disabled) {
      return isPressed.value ? 'true' : 'false'
    }
    return undefined
  })

  // Color del icono
  const getIconColor = (badgeVariant: BadgeVariant) => {
    const colorMap: Record<BadgeVariant, string> = {
      primary: 'current',
      secondary: 'muted',
      success: 'success',
      warning: 'warning',
      error: 'error',
      info: 'info',
      neutral: 'muted',
      subtle: 'muted',
    }
    return colorMap[badgeVariant]
  }

  // Formatear contador
  const formatCount = (countValue: number): string =>
    formatBadgeCount(countValue)

  // Tipografía del badge
  const getBadgeTypography = () => {
    const typographyMap = {
      xs: 'text-xs font-medium',
      sm: 'text-sm font-medium',
      md: 'text-sm font-medium',
      lg: 'text-base font-medium',
    }
    return typographyMap[size]
  }

  // Si debe animar
  const shouldAnimate = computed(() => {
    // Verificar preferencias de motion
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (prefersReducedMotion) return false
    }
    return true
  })

  // Manejar presión
  const handlePress = () => {
    if (disabled || loading) return
    isPressed.value = true
  }

  // Resetear presión
  const resetPress = () => {
    isPressed.value = false
  }

  return {
    // Estado
    isPressed: readonly(isPressed),
    badgeState: readonly(badgeState),

    // Clases
    sizeClasses,
    variantClasses,
    countClasses,

    // ARIA
    computedRole,
    computedAriaLabel,
    computedAriaPressed,

    // Utilidades
    getIconColor,
    formatCount,
    getBadgeTypography,
    shouldAnimate,

    // Métodos
    handlePress,
    resetPress,
  }
}
