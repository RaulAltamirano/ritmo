// Composable para Accesibilidad (A11y) - Ritmo UI 2025
// Implementa las mejores prácticas de WCAG 2.2

import { computed, readonly, ref } from 'vue'

export interface A11yOptions {
  /** Rol ARIA del elemento */
  role?: string
  /** Label ARIA para lectores de pantalla */
  ariaLabel?: string
  /** Si el elemento debe anunciarse a lectores de pantalla */
  ariaLive?: 'off' | 'polite' | 'assertive'
  /** Si el elemento es atómico para lectores de pantalla */
  ariaAtomic?: boolean
  /** Si el elemento está ocupado */
  ariaBusy?: boolean
  /** Si el elemento está presionado */
  ariaPressed?: boolean
  /** Si el elemento está expandido */
  ariaExpanded?: boolean
  /** Si el elemento está seleccionado */
  ariaSelected?: boolean
  /** Si el elemento está deshabilitado */
  ariaDisabled?: boolean
  /** Si el elemento está oculto */
  ariaHidden?: boolean
}

export function useA11y(options: A11yOptions = {}) {
  const {
    role = 'generic',
    ariaLabel,
    ariaLive = 'off',
    ariaAtomic = false,
    ariaBusy = false,
    ariaPressed,
    ariaExpanded,
    ariaSelected,
    ariaDisabled,
    ariaHidden,
  } = options

  // Estado para anuncios a lectores de pantalla
  const announcementQueue = ref<string[]>([])
  const isAnnouncing = ref(false)

  // Estado reactivo para atributos ARIA
  const currentAriaLabel = ref(ariaLabel || '')
  const currentAriaPressed = ref(ariaPressed)

  // Atributos ARIA computados
  const ariaAttributes = computed(() => {
    const attrs: Record<string, string | boolean> = {
      role,
    }

    if (currentAriaLabel.value) {
      attrs['aria-label'] = currentAriaLabel.value
    }

    if (ariaLive !== 'off') {
      attrs['aria-live'] = ariaLive
    }

    if (ariaAtomic) {
      attrs['aria-atomic'] = ariaAtomic
    }

    if (ariaBusy) {
      attrs['aria-busy'] = ariaBusy
    }

    if (currentAriaPressed.value !== undefined) {
      attrs['aria-pressed'] = currentAriaPressed.value
    }

    if (ariaExpanded !== undefined) {
      attrs['aria-expanded'] = ariaExpanded
    }

    if (ariaSelected !== undefined) {
      attrs['aria-selected'] = ariaSelected
    }

    if (ariaDisabled !== undefined) {
      attrs['aria-disabled'] = ariaDisabled
    }

    if (ariaHidden !== undefined) {
      attrs['aria-hidden'] = ariaHidden
    }

    return attrs
  })

  // Función para establecer el label ARIA
  const setAriaLabel = (label: string) => {
    currentAriaLabel.value = label
  }

  // Función para establecer el estado pressed ARIA
  const setAriaPressed = (pressed: boolean) => {
    currentAriaPressed.value = pressed
  }

  // Anunciar a lectores de pantalla
  const announceToScreenReader = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
  ) => {
    // Agregar mensaje a la cola
    announcementQueue.value.push(message)

    // Si no hay anuncio en progreso, procesar la cola
    if (!isAnnouncing.value) {
      processAnnouncementQueue(priority)
    }
  }

  // Procesar cola de anuncios
  const processAnnouncementQueue = (priority: 'polite' | 'assertive') => {
    if (announcementQueue.value.length === 0) {
      isAnnouncing.value = false
      return
    }

    isAnnouncing.value = true
    const message = announcementQueue.value.shift()!

    // Crear elemento de anuncio
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    // Agregar al DOM
    document.body.appendChild(announcement)

    // Remover después de un delay
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement)
      }

      // Procesar siguiente mensaje
      processAnnouncementQueue(priority)
    }, 100)
  }

  // Validar contraste de colores
  const validateColorContrast = (foreground: string, background: string): boolean => {
    // Implementación básica de validación de contraste
    // En producción, usar librería especializada como color-contrast
    try {
      const fg = hexToRgb(foreground)
      const bg = hexToRgb(background)

      if (!fg || !bg) return false

      const contrast = calculateContrastRatio(fg, bg)
      return contrast >= 4.5 // WCAG AA para texto normal
    } catch {
      return false
    }
  }

  // Convertir hex a RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  // Calcular ratio de contraste
  const calculateContrastRatio = (
    fg: { r: number; g: number; b: number },
    bg: { r: number; g: number; b: number },
  ): number => {
    const fgLuminance = calculateLuminance(fg)
    const bgLuminance = calculateLuminance(bg)

    const lighter = Math.max(fgLuminance, bgLuminance)
    const darker = Math.min(fgLuminance, bgLuminance)

    return (lighter + 0.05) / (darker + 0.05)
  }

  // Calcular luminancia
  const calculateLuminance = (color: { r: number; g: number; b: number }): number => {
    const { r, g, b } = color
    const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c => {
      if (c <= 0.03928) {
        return c / 12.92
      }
      return Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Verificar preferencias de usuario
  const userPreferences = computed(() => {
    if (typeof window === 'undefined') return {}

    return {
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches,
      prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
      prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',
    }
  })

  // Generar ID único para elementos ARIA
  const generateAriaId = (prefix: string = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Validar accesibilidad general
  const validateAccessibility = () => {
    // Validaciones básicas de accesibilidad
    const issues: string[] = []

    if (!currentAriaLabel.value) {
      issues.push('Missing aria-label')
    }

    if (currentAriaPressed.value === undefined && role === 'button') {
      issues.push('Button missing aria-pressed state')
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings: issues.length > 0 ? issues : [],
    }
  }

  return {
    // Atributos ARIA
    ariaAttributes: readonly(ariaAttributes),

    // Métodos de establecimiento de ARIA
    setAriaLabel,
    setAriaPressed,

    // Métodos de anuncio
    announceToScreenReader,

    // Validación de accesibilidad
    validateColorContrast,
    validateAccessibility,

    // Preferencias del usuario
    userPreferences: readonly(userPreferences),

    // Utilidades
    generateAriaId,
  }
}
