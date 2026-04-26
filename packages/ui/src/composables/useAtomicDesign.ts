// Composable para el Sistema de Diseño Atómico
// Centraliza la lógica común que todos los átomos comparten
// OPTIMIZADO para Vue 3 + Performance + INP

import { computed, readonly, shallowRef } from 'vue'
import { useColors } from './useColors'
import { useTypography } from './useTypography'

export interface AtomicState {
  isHovered: boolean
  isFocused: boolean
  isPressed: boolean
  isDisabled: boolean
  isLoading: boolean
}

export interface AtomicSize {
  width: string
  padding: string
  text: string
  minHeight: string
  height: string
}

export interface AtomicColor {
  background: string
  text: string
  border: string
  hover: string
  focus: string
}

export interface AtomicIcon {
  size: string
  color: string
  base: string
}

// Cache global para evitar recreaciones
const stateCache = new Map<string, AtomicState>()
const sizeCache = new Map<string, string>()
const colorCache = new Map<string, AtomicColor>()
const spacingCache = new Map<string, string>()
const borderCache = new Map<string, Record<string, string>>()
const transitionCache = new Map<string, Record<string, string>>()
const stateCache2 = new Map<string, string[]>()
const iconCache = new Map<string, AtomicIcon>()

export function useAtomicDesign() {
  // Estado común para todos los átomos - OPTIMIZADO con cache
  const createAtomicState = (): AtomicState => ({
    isHovered: false,
    isFocused: false,
    isPressed: false,
    isDisabled: false,
    isLoading: false,
  })

  // Gestión de estado reactivo - OPTIMIZADO con shallowRef y cache
  const useAtomicState = (cacheKey = 'default') => {
    if (!stateCache.has(cacheKey)) {
      stateCache.set(cacheKey, createAtomicState())
    }

    const state = shallowRef<AtomicState>(stateCache.get(cacheKey)!)

    // Funciones optimizadas para evitar recreaciones - MEMOIZADAS
    const setHovered = (value: boolean) => {
      if (state.value.isHovered !== value) {
        state.value.isHovered = value
      }
    }

    const setFocused = (value: boolean) => {
      if (state.value.isFocused !== value) {
        state.value.isFocused = value
      }
    }

    const setPressed = (value: boolean) => {
      if (state.value.isPressed !== value) {
        state.value.isPressed = value
      }
    }

    const setDisabled = (value: boolean) => {
      if (state.value.isDisabled !== value) {
        state.value.isDisabled = value
      }
    }

    const setLoading = (value: boolean) => {
      if (state.value.isLoading !== value) {
        state.value.isLoading = value
      }
    }

    const resetState = () => {
      const defaultState = createAtomicState()
      Object.assign(state.value, defaultState)
    }

    return {
      state: readonly(state),
      setHovered,
      setFocused,
      setPressed,
      setDisabled,
      setLoading,
      resetState,
    }
  }

  // Sistema de tamaños unificado - OPTIMIZADO con cache
  const useAtomicSize = (size: string) => {
    const cacheKey = `size-${size}`

    if (!sizeCache.has(cacheKey)) {
      sizeCache.set(cacheKey, `size-${size}`)
    }

    return computed(() => sizeCache.get(cacheKey)!)
  }

  // Sistema de colores semánticos - OPTIMIZADO con cache
  const useAtomicColor = (colorVariant: string) => {
    const cacheKey = `color-${colorVariant}`

    if (!colorCache.has(cacheKey)) {
      colorCache.set(cacheKey, {
        background: `bg-${colorVariant}-500`,
        text: `text-${colorVariant}-600`,
        border: `border-${colorVariant}-200`,
        hover: `hover:bg-${colorVariant}-100`,
        focus: `focus:ring-${colorVariant}-500`,
      })
    }

    return computed(() => colorCache.get(cacheKey)!)
  }

  // Sistema de espaciado consistente - OPTIMIZADO con cache
  const useAtomicSpacing = (spacingType: string, size: string) => {
    const cacheKey = `${spacingType}-${size}`

    if (!spacingCache.has(cacheKey)) {
      spacingCache.set(cacheKey, `${spacingType}-${size}`)
    }

    return computed(() => spacingCache.get(cacheKey)!)
  }

  // Sistema de bordes y sombras - OPTIMIZADO con cache
  const useAtomicBorders = (borderType: string, variant: string) => {
    const cacheKey = `border-${borderType}-${variant}`

    if (!borderCache.has(cacheKey)) {
      borderCache.set(cacheKey, {
        radius: `rounded-${variant}`,
        shadow: 'shadow-md',
        width: 'border',
      })
    }

    return computed(() => borderCache.get(cacheKey)!)
  }

  // Sistema de transiciones - OPTIMIZADO con cache
  const useAtomicTransitions = (duration: string, easing: string) => {
    const cacheKey = `transition-${duration}-${easing}`

    if (!transitionCache.has(cacheKey)) {
      transitionCache.set(cacheKey, {
        duration: `duration-${duration}`,
        easing: `ease-${easing}`,
        transform: 'transition-all',
      })
    }

    return computed(() => transitionCache.get(cacheKey)!)
  }

  // Sistema de estados interactivos - OPTIMIZADO con cache
  const useAtomicStates = (state: AtomicState) => {
    const stateKey = `${state.isDisabled}-${state.isHovered}-${state.isPressed}-${state.isFocused}`

    if (!stateCache2.has(stateKey)) {
      const states: string[] = []

      if (state.isDisabled) {
        states.push('opacity-50')
        states.push('cursor-not-allowed')
        states.push('pointer-events-none')
      } else {
        if (state.isHovered) {
          states.push('hover:-translate-y-0.5')
          states.push('hover:shadow-lg')
          states.push('hover:scale-105')
        }
        if (state.isPressed) {
          states.push('active:translate-y-0')
          states.push('active:shadow-md')
          states.push('active:scale-95')
        }
        if (state.isFocused) {
          states.push('focus-visible:ring-2')
          states.push('focus-visible:outline-none')
        }
      }

      stateCache2.set(stateKey, states)
    }

    return computed(() => stateCache2.get(stateKey)!.join(' '))
  }

  // Sistema de iconos unificado - OPTIMIZADO con cache
  const useAtomicIcon = (size: string, color: string) => {
    const cacheKey = `icon-${size}-${color}`

    if (!iconCache.has(cacheKey)) {
      iconCache.set(cacheKey, {
        size: `w-${size} h-${size}`,
        color: `text-${color}-600`,
        base: 'inline-block flex-shrink-0 transition-colors duration-200 stroke-current',
      })
    }

    return computed(() => iconCache.get(cacheKey)!)
  }

  // Composición de clases CSS - OPTIMIZADO
  const composeClasses = (...classGroups: Array<string | undefined | null | false>) => {
    return classGroups.filter(Boolean).join(' ').trim()
  }

  // Validación de props comunes - OPTIMIZADO con cache
  const validateAtomicProps = (
    props: Record<string, any>,
    validators: Record<string, (val: any) => boolean>,
  ) => {
    const errors: string[] = []

    Object.entries(validators).forEach(([prop, validator]) => {
      if (props[prop] !== undefined && !validator(props[prop])) {
        errors.push(`Invalid value for prop '${prop}': ${props[prop]}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Sistema de accesibilidad común - OPTIMIZADO
  const useAtomicAccessibility = (role?: string, ariaLabel?: string) => {
    const cacheKey = `a11y-${role}-${ariaLabel}`

    if (!colorCache.has(cacheKey)) {
      colorCache.set(cacheKey, {
        role: role ?? 'generic',
        'aria-label': ariaLabel,
        'aria-hidden': !ariaLabel,
        tabindex: role === 'button' ? 0 : undefined,
      } as any)
    }

    return computed(() => colorCache.get(cacheKey)!)
  }

  // Sistema de eventos comunes - OPTIMIZADO
  const useAtomicEvents = (emit: any) => {
    const handleClick = (event: any) => {
      emit('click', event)
    }

    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleClick(event)
      }
    }

    const handleMouseEnter = (event: any) => {
      emit('mouseenter', event)
    }

    const handleMouseLeave = (event: any) => {
      emit('mouseleave', event)
    }

    const handleFocus = (event: any) => {
      emit('focus', event)
    }

    const handleBlur = (event: any) => {
      emit('blur', event)
    }

    return {
      handleClick,
      handleKeyDown,
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
    }
  }

  // Sistema de animaciones comunes - OPTIMIZADO con cache
  const useAtomicAnimations = (
    animationType: 'subtle' | 'smooth' | 'bouncy' = 'smooth',
  ) => {
    const cacheKey = `animation-${animationType}`

    if (!transitionCache.has(cacheKey)) {
      const animations = {
        subtle: 'transition-all duration-200 ease-out',
        smooth: 'transition-all duration-300 ease-in-out',
        bouncy: 'transition-all duration-300 ease-out',
      }

      transitionCache.set(cacheKey, {
        animation: animations[animationType],
        duration: '',
        easing: '',
        transform: '',
      })
    }

    return computed(() => transitionCache.get(cacheKey)!.animation)
  }

  // Sistema de responsive design - OPTIMIZADO
  const useAtomicResponsive = (breakpoints: Record<string, string>) => {
    const cacheKey = JSON.stringify(breakpoints)

    if (!spacingCache.has(cacheKey)) {
      const responsiveClasses: string[] = []

      Object.entries(breakpoints).forEach(([, classes]) => {
        responsiveClasses.push(classes)
      })

      spacingCache.set(cacheKey, responsiveClasses.join(' '))
    }

    return computed(() => spacingCache.get(cacheKey)!)
  }

  // Función de limpieza para testing
  const clearCache = () => {
    stateCache.clear()
    sizeCache.clear()
    colorCache.clear()
    spacingCache.clear()
    borderCache.clear()
    transitionCache.clear()
    stateCache2.clear()
    iconCache.clear()
  }

  // Component variants para el sistema
  const componentVariants = {
    button: {
      base: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      variants: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
        error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        outline:
          'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      },
      sizes: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
      },
    },
  }

  return {
    // Composable functions
    useAtomicState,
    useAtomicSize,
    useAtomicColor,
    useAtomicSpacing,
    useAtomicBorders,
    useAtomicTransitions,
    useAtomicStates,
    useAtomicIcon,
    useAtomicAccessibility,
    useAtomicEvents,
    useAtomicAnimations,
    useAtomicResponsive,

    // Component variants
    componentVariants,

    // Typography
    useTypography,

    // Colors
    useColors,

    // Utility functions
    composeClasses,
    validateAtomicProps,
    clearCache, // Para testing
  }
}

// Los tipos ya están exportados en la definición de las interfaces
