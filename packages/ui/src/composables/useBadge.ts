// Composable para manejo de badges - Ritmo UI 2025
// Implementa la lógica que falta en BaseBadge.vue

import { computed, ref, readonly } from 'vue'
import type { Component } from 'vue'
import type { BadgeVariant, BadgeSize, BadgeIconPosition } from '@/types/badge'

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
    iconPosition,
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

  // Clases de variante
  const variantClasses = computed(() => {
    const baseClasses =
      'inline-flex items-center justify-center gap-1.5 rounded-full border font-medium transition-all'

    const variantMap = {
      primary: 'bg-primary-500 text-white border-primary-300 hover:bg-primary-600',
      secondary: 'bg-neutral-100 text-gray-800 border-neutral-300 hover:bg-neutral-200',
      success: 'bg-success-500 text-white border-success-300 hover:bg-success-600',
      warning: 'bg-warning-500 text-gray-900 border-warning-300 hover:bg-warning-600',
      error: 'bg-error-500 text-white border-error-300 hover:bg-error-600',
      info: 'bg-info-500 text-white border-info-300 hover:bg-info-600',
      neutral: 'bg-neutral-100 text-gray-800 border-neutral-300 hover:bg-neutral-200',
    }

    return `${baseClasses} ${variantMap[variant]}`
  })

  // Clases del contador
  const countClasses = computed(
    () =>
      ({
        primary: 'bg-primary-600 text-white',
        secondary: 'bg-neutral-200 text-gray-800',
        success: 'bg-success-600 text-white',
        warning: 'bg-warning-600 text-gray-900',
        error: 'bg-error-600 text-white',
        info: 'bg-info-600 text-white',
        neutral: 'bg-neutral-200 text-gray-800',
      })[variant],
  )

  // Rol ARIA computado
  const computedRole = computed(() => {
    if (role) return role
    if (clickable) return 'button'
    if (loading) return 'status'
    return 'generic'
  })

  // Label ARIA computado
  const computedAriaLabel = computed(() => {
    if (ariaLabel) return ariaLabel

    let label = content || 'Badge'
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
    const colorMap = {
      primary: 'current',
      secondary: 'muted',
      success: 'success',
      warning: 'warning',
      error: 'error',
      info: 'info',
      neutral: 'muted',
    }
    return colorMap[badgeVariant]
  }

  // Formatear contador
  const formatCount = (countValue: number): string => {
    if (countValue >= 1000) {
      return countValue >= 1000000
        ? `${(countValue / 1000000).toFixed(1)}M`
        : `${(countValue / 1000).toFixed(1)}K`
    }
    return countValue.toString()
  }

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
