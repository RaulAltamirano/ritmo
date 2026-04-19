// Composable para Colores - Ritmo UI 2025
// Sistema centralizado de colores semánticos y tokens

import { computed, readonly, ref } from 'vue'

export interface ColorTokens {
  primary: Record<string, string>
  secondary: Record<string, string>
  success: Record<string, string>
  warning: Record<string, string>
  error: Record<string, string>
  info: Record<string, string>
  neutral: Record<string, string>
}

export interface SemanticColors {
  text: {
    primary: string
    secondary: string
    tertiary: string
    quaternary: string
    inverse: string
  }
  surface: {
    primary: string
    secondary: string
    tertiary: string
    backdrop: string
    overlay: string
  }
  border: {
    primary: string
    secondary: string
    tertiary: string
  }
  forms: {
    input: string
    inputFocus: string
    inputError: string
    inputSuccess: string
  }
  alerts: {
    info: {
      background: string
      border: string
      text: string
    }
    success: {
      background: string
      border: string
      text: string
    }
    warning: {
      background: string
      border: string
      text: string
    }
    error: {
      background: string
      border: string
      text: string
    }
    neutral: {
      background: string
      border: string
      text: string
    }
  }
  progress: {
    info: string
    success: string
    warning: string
    error: string
  }
  state: {
    hover: string
    active: string
    focus: string
    disabled: string
  }
}

export function useColors() {
  // Tokens de colores base
  const colorTokens = ref<ColorTokens>({
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      200: 'bg-blue-200',
      300: 'bg-blue-300',
      400: 'bg-blue-400',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
      800: 'bg-blue-800',
      900: 'bg-blue-900',
      950: 'bg-blue-950',
    },
    secondary: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      300: 'bg-gray-300',
      400: 'bg-gray-400',
      500: 'bg-gray-500',
      600: 'bg-gray-600',
      700: 'bg-gray-700',
      800: 'bg-gray-800',
      900: 'bg-gray-900',
      950: 'bg-gray-950',
    },
    success: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      200: 'bg-green-200',
      300: 'bg-green-300',
      400: 'bg-green-400',
      500: 'bg-green-500',
      600: 'bg-green-600',
      700: 'bg-green-700',
      800: 'bg-green-800',
      900: 'bg-green-900',
      950: 'bg-green-950',
    },
    warning: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      200: 'bg-yellow-200',
      300: 'bg-yellow-300',
      400: 'bg-yellow-400',
      500: 'bg-yellow-500',
      600: 'bg-yellow-600',
      700: 'bg-yellow-700',
      800: 'bg-yellow-800',
      900: 'bg-yellow-900',
      950: 'bg-yellow-950',
    },
    error: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      200: 'bg-red-200',
      300: 'bg-red-300',
      400: 'bg-red-400',
      500: 'bg-red-500',
      600: 'bg-red-600',
      700: 'bg-red-700',
      800: 'bg-red-800',
      900: 'bg-red-900',
      950: 'bg-red-950',
    },
    info: {
      50: 'bg-cyan-50',
      100: 'bg-cyan-100',
      200: 'bg-cyan-200',
      300: 'bg-cyan-300',
      400: 'bg-cyan-400',
      500: 'bg-cyan-500',
      600: 'bg-cyan-600',
      700: 'bg-cyan-700',
      800: 'bg-cyan-800',
      900: 'bg-cyan-900',
      950: 'bg-cyan-950',
    },
    neutral: {
      50: 'bg-slate-50',
      100: 'bg-slate-100',
      200: 'bg-slate-200',
      300: 'bg-slate-300',
      400: 'bg-slate-400',
      500: 'bg-slate-500',
      600: 'bg-slate-600',
      700: 'bg-slate-700',
      800: 'bg-slate-800',
      900: 'bg-slate-900',
      950: 'bg-slate-950',
    },
  })

  // Colores semánticos
  const semanticColors = ref<SemanticColors>({
    text: {
      primary: 'text-gray-900 dark:text-white',
      secondary: 'text-gray-700 dark:text-gray-300',
      tertiary: 'text-gray-500 dark:text-gray-400',
      quaternary: 'text-gray-400 dark:text-gray-500',
      inverse: 'text-white dark:text-gray-900',
    },
    surface: {
      primary: 'bg-white dark:bg-gray-900',
      secondary: 'bg-gray-50 dark:bg-gray-800',
      tertiary: 'bg-gray-100 dark:bg-gray-700',
      backdrop: 'bg-black/50 dark:bg-black/70',
      overlay: 'bg-white/80 dark:bg-gray-900/80',
    },
    border: {
      primary: 'border-gray-200 dark:border-gray-700',
      secondary: 'border-gray-300 dark:border-gray-600',
      tertiary: 'border-gray-400 dark:border-gray-500',
    },
    forms: {
      input: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
      inputFocus: 'border-blue-500 dark:border-blue-400 ring-blue-500/20',
      inputError: 'border-red-500 dark:border-red-400 ring-red-500/20',
      inputSuccess: 'border-green-500 dark:border-green-400 ring-green-500/20',
    },
    alerts: {
      info: {
        background: 'bg-blue-50 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-700',
        text: 'text-blue-800 dark:text-blue-200',
      },
      success: {
        background: 'bg-green-50 dark:bg-green-900/30',
        border: 'border-green-200 dark:border-green-700',
        text: 'text-green-800 dark:text-green-200',
      },
      warning: {
        background: 'bg-yellow-50 dark:bg-yellow-900/30',
        border: 'border-yellow-200 dark:border-yellow-700',
        text: 'text-yellow-800 dark:text-yellow-200',
      },
      error: {
        background: 'bg-red-50 dark:bg-red-900/30',
        border: 'border-red-200 dark:border-red-700',
        text: 'text-red-800 dark:text-red-200',
      },
      neutral: {
        background: 'bg-gray-50 dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
      },
    },
    progress: {
      info: 'bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-400 dark:to-cyan-500',
      success:
        'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500',
      warning:
        'bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500',
      error:
        'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500',
    },
    state: {
      hover: 'hover:bg-gray-50 dark:hover:bg-gray-800',
      active: 'active:bg-gray-100 dark:active:bg-gray-700',
      focus: 'focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  })

  // Función para obtener colores de variante
  const getVariantColors = (variant: keyof ColorTokens) => {
    return computed(() => colorTokens.value[variant])
  }

  // Función para obtener colores semánticos
  const getSemanticColors = () => {
    return computed(() => semanticColors.value)
  }

  // Función para obtener colores de superficie
  const getSurface = (type: keyof SemanticColors['surface']) => {
    return computed(() => semanticColors.value.surface[type])
  }

  // Función para obtener colores de texto
  const getTextSemantic = (type: keyof SemanticColors['text']) => {
    return computed(() => semanticColors.value.text[type])
  }

  // Función para obtener colores de borde
  const getBorderSemantic = (type: keyof SemanticColors['border']) => {
    return computed(() => semanticColors.value.border[type])
  }

  // Función para obtener colores de formularios
  const getFormColors = (type: keyof SemanticColors['forms']) => {
    return computed(() => semanticColors.value.forms[type])
  }

  // Función para obtener colores de alertas
  const getAlertColors = (type: keyof SemanticColors['alerts']) => {
    return computed(() => semanticColors.value.alerts[type])
  }

  // Función para obtener colores de progreso
  const getProgressColors = (type: keyof SemanticColors['progress']) => {
    return computed(() => semanticColors.value.progress[type])
  }

  // Función para obtener colores de estado
  const getStateColors = (type: keyof SemanticColors['state']) => {
    return computed(() => semanticColors.value.state[type])
  }

  // Función para obtener color específico
  const getColor = (
    variant: keyof ColorTokens,
    shade: keyof ColorTokens['primary'],
  ) => {
    return computed(() => colorTokens.value[variant][shade])
  }

  // Función para obtener color de texto específico
  const getTextColor = (
    variant: keyof ColorTokens,
    shade: keyof ColorTokens['primary'],
  ) => {
    const bgShade = parseInt(shade)
    // Para contraste óptimo: fondos oscuros (>= 500) usar texto claro, fondos claros (< 500) usar texto oscuro
    const textShade = bgShade >= 500 ? '50' : '900'
    return `text-${variant}-${textShade}`
  }

  // Función para obtener colores de texto (para fondos)
  const getTextColorForBackground = (
    variant: keyof ColorTokens,
    shade: keyof ColorTokens['primary'],
  ) => {
    const bgShade = parseInt(shade)
    const textShade = bgShade >= 500 ? '50' : '900'
    return `text-${variant}-${textShade}`
  }

  // Función para obtener color de texto de botones (mejor contraste)
  const getButtonTextColor = (
    variant: keyof ColorTokens,
    shade: keyof ColorTokens['primary'],
  ) => {
    const bgShade = parseInt(shade)
    // Para botones: fondos oscuros (>= 600) usar texto claro, fondos claros (< 600) usar texto oscuro
    // Esto asegura contraste óptimo en ambos modos
    const textShade = bgShade >= 600 ? '50' : '900'
    return `text-${variant}-${textShade}`
  }

  // Función para obtener colores de borde
  const getBorderColor = (
    variant: keyof ColorTokens,
    shade: keyof ColorTokens['primary'],
  ) => {
    const bgShade = parseInt(shade)
    const borderShade = bgShade >= 500 ? '200' : '300'
    return computed(() => `border-${variant}-${borderShade}`)
  }

  // Función para obtener colores de hover
  const getHoverColor = (
    variant: keyof ColorTokens,
    shade: keyof ColorTokens['primary'],
  ) => {
    const bgShade = parseInt(shade)
    const hoverShade = bgShade >= 500 ? '400' : '100'
    return computed(() => `hover:bg-${variant}-${hoverShade}`)
  }

  // Función para obtener colores de focus
  const getFocusColor = (variant: keyof ColorTokens) => {
    return computed(() => `focus:ring-${variant}-500/20`)
  }

  // Función para obtener colores de disabled
  const getDisabledColor = () => {
    return computed(() => 'opacity-50 cursor-not-allowed')
  }

  // Función para obtener colores de loading
  const getLoadingColor = (variant: keyof ColorTokens) => {
    return computed(() => `animate-pulse bg-${variant}-200`)
  }

  // Función para obtener colores de error
  const getErrorColor = () => {
    return computed(() => 'border-red-500 text-red-700 bg-red-50')
  }

  // Función para obtener colores de success
  const getSuccessColor = () => {
    return computed(() => 'border-green-500 text-green-700 bg-green-50')
  }

  // Función para obtener colores de warning
  const getWarningColor = () => {
    return computed(() => 'border-yellow-500 text-yellow-700 bg-yellow-50')
  }

  // Función para obtener colores de info
  const getInfoColor = () => {
    return computed(() => 'border-blue-500 text-blue-700 bg-blue-50')
  }

  // Función para obtener colores de neutral
  const getNeutralColor = () => {
    return computed(() => 'border-gray-500 text-gray-700 bg-gray-50')
  }

  // Función para obtener colores de dark mode
  const getDarkModeColors = () => {
    return computed(() => ({
      background: 'dark:bg-gray-900',
      text: 'dark:text-white',
      border: 'dark:border-gray-700',
    }))
  }

  // Función para obtener colores de light mode
  const getLightModeColors = () => {
    return computed(() => ({
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200',
    }))
  }

  // Función para obtener colores de high contrast
  const getHighContrastColors = () => {
    return computed(() => ({
      background: 'bg-black text-white',
      text: 'text-white',
      border: 'border-white',
    }))
  }

  // Función para obtener colores de reduced motion
  const getReducedMotionColors = () => {
    return computed(() => ({
      transition: 'transition-none',
      animation: 'animate-none',
      transform: 'transform-none',
    }))
  }

  return {
    // Tokens de colores
    colorTokens: readonly(colorTokens),
    semanticColors: readonly(semanticColors),

    // Funciones de utilidad
    getVariantColors,
    getSemanticColors,
    getSurface,
    getTextSemantic,
    getBorderSemantic,
    getFormColors,
    getAlertColors,
    getProgressColors,
    getStateColors,
    getColor,
    getTextColor,
    getTextColorForBackground,
    getButtonTextColor,
    getBorderColor,
    getHoverColor,
    getFocusColor,
    getDisabledColor,
    getLoadingColor,
    getErrorColor,
    getSuccessColor,
    getWarningColor,
    getInfoColor,
    getNeutralColor,
    getDarkModeColors,
    getLightModeColors,
    getHighContrastColors,
    getReducedMotionColors,

    // Acceso directo a colores
    variants: computed(() => colorTokens.value),
    alerts: computed(() => semanticColors.value.alerts),
    forms: computed(() => semanticColors.value.forms),
    states: computed(() => semanticColors.value.state),
  }
}
