// Sistema de Colores Unificado - Ritmo UI 2025
// Implementa las mejores prácticas de diseño de sistemas modernos
// Basado en: Material Design 3, Apple HIG, y estándares de accesibilidad WCAG 2.2

export const semanticColors = {
  // Colores primarios
  primary: {
    50: 'bg-blue-50 text-blue-600 border-blue-200',
    100: 'bg-blue-100 text-blue-700 border-blue-300',
    200: 'bg-blue-200 text-blue-800 border-blue-400',
    300: 'bg-blue-300 text-blue-900 border-blue-500',
    // Tonos medios: texto oscuro para contraste AA sobre fondo claro
    400: 'bg-blue-400 text-blue-950 border-blue-600',
    500: 'bg-blue-500 text-white border-blue-700',
    600: 'bg-blue-600 text-white border-blue-800',
    700: 'bg-blue-700 text-white border-blue-900',
    800: 'bg-blue-800 text-white border-blue-950',
    900: 'bg-blue-900 text-white border-blue-950',
    950: 'bg-blue-950 text-white border-blue-950',
  },

  // Colores secundarios
  secondary: {
    50: 'bg-neutral-50 text-neutral-600 border-neutral-200',
    100: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    200: 'bg-neutral-200 text-neutral-800 border-neutral-400',
    300: 'bg-neutral-300 text-neutral-900 border-neutral-500',
    400: 'bg-neutral-400 text-neutral-950 border-neutral-600',
    500: 'bg-neutral-500 text-neutral-950 border-neutral-700',
    600: 'bg-neutral-600 text-white border-neutral-800',
    700: 'bg-neutral-700 text-white border-neutral-900',
    800: 'bg-neutral-800 text-white border-neutral-950',
    900: 'bg-neutral-900 text-white border-neutral-950',
    950: 'bg-neutral-950 text-white border-neutral-950',
  },

  // Colores de éxito
  success: {
    50: 'bg-green-50 text-green-600 border-green-200',
    100: 'bg-green-100 text-green-700 border-green-300',
    200: 'bg-green-200 text-green-800 border-green-400',
    300: 'bg-green-300 text-green-900 border-green-500',
    400: 'bg-green-400 text-green-950 border-green-600',
    500: 'bg-green-500 text-green-950 border-green-700',
    600: 'bg-green-600 text-white border-green-800',
    700: 'bg-green-700 text-white border-green-900',
    800: 'bg-green-800 text-white border-green-950',
    900: 'bg-green-900 text-white border-green-950',
    950: 'bg-green-950 text-white border-green-950',
  },

  // Colores de advertencia
  warning: {
    50: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    100: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    200: 'bg-yellow-200 text-yellow-800 border-yellow-400',
    300: 'bg-yellow-300 text-yellow-900 border-yellow-500',
    400: 'bg-yellow-400 text-yellow-950 border-yellow-700',
    500: 'bg-yellow-500 text-yellow-950 border-yellow-800',
    600: 'bg-yellow-600 text-yellow-950 border-yellow-800',
    700: 'bg-yellow-700 text-white border-yellow-900',
    800: 'bg-yellow-800 text-white border-yellow-950',
    900: 'bg-yellow-900 text-white border-yellow-950',
    950: 'bg-yellow-950 text-white border-yellow-950',
  },

  // Colores de error
  error: {
    50: 'bg-red-50 text-red-600 border-red-200',
    100: 'bg-red-100 text-red-700 border-red-300',
    200: 'bg-red-200 text-red-800 border-red-400',
    300: 'bg-red-300 text-red-900 border-red-500',
    400: 'bg-red-400 text-red-950 border-red-600',
    500: 'bg-red-500 text-white border-red-700',
    600: 'bg-red-600 text-white border-red-800',
    700: 'bg-red-700 text-white border-red-900',
    800: 'bg-red-800 text-white border-red-950',
    900: 'bg-red-900 text-white border-red-950',
    950: 'bg-red-950 text-white border-red-950',
  },

  // Colores de información
  info: {
    50: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    100: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    200: 'bg-cyan-200 text-cyan-800 border-cyan-400',
    300: 'bg-cyan-300 text-cyan-900 border-cyan-500',
    400: 'bg-cyan-400 text-cyan-950 border-cyan-600',
    500: 'bg-cyan-500 text-cyan-950 border-cyan-700',
    600: 'bg-cyan-600 text-white border-cyan-800',
    700: 'bg-cyan-700 text-white border-cyan-900',
    800: 'bg-cyan-800 text-white border-cyan-950',
    900: 'bg-cyan-900 text-white border-cyan-950',
    950: 'bg-cyan-950 text-white border-cyan-950',
  },

  // Colores neutros
  neutral: {
    50: 'bg-gray-50 text-gray-600 border-gray-200',
    100: 'bg-gray-100 text-gray-700 border-gray-300',
    200: 'bg-gray-200 text-gray-800 border-gray-400',
    300: 'bg-gray-300 text-gray-900 border-gray-500',
    400: 'bg-gray-400 text-gray-950 border-gray-600',
    500: 'bg-gray-500 text-gray-950 border-gray-700',
    600: 'bg-gray-600 text-white border-gray-800',
    700: 'bg-gray-700 text-white border-gray-900',
    800: 'bg-gray-800 text-white border-gray-950',
    900: 'bg-gray-900 text-white border-gray-950',
    950: 'bg-gray-950 text-white border-gray-950',
  },

  // Colores de estado
  state: {
    hover: {
      primary: 'hover:bg-blue-600 hover:border-blue-700',
      secondary: 'hover:bg-neutral-200 hover:border-neutral-400',
      success: 'hover:bg-green-600 hover:border-green-700',
      warning: 'hover:bg-yellow-600 hover:border-yellow-700',
      error: 'hover:bg-red-600 hover:border-red-700',
      info: 'hover:bg-cyan-600 hover:border-cyan-700',
      neutral: 'hover:bg-gray-200 hover:border-gray-400',
    },
    focus: {
      primary: 'focus:ring-blue-500 focus:border-blue-500',
      secondary: 'focus:ring-neutral-500 focus:border-neutral-500',
      success: 'focus:ring-green-500 focus:border-green-500',
      warning: 'focus:ring-yellow-500 focus:border-yellow-500',
      error: 'focus:ring-red-500 focus:border-red-500',
      info: 'focus:ring-cyan-500 focus:border-cyan-500',
      neutral: 'focus:ring-gray-500 focus:border-gray-500',
    },
    active: {
      primary: 'active:bg-blue-700 active:border-blue-800',
      secondary: 'active:bg-neutral-300 active:border-neutral-500',
      success: 'active:bg-green-700 active:border-green-800',
      warning: 'active:bg-yellow-700 active:border-yellow-800',
      error: 'active:bg-red-700 active:border-red-800',
      info: 'active:bg-cyan-700 active:border-cyan-800',
      neutral: 'active:bg-gray-300 active:border-gray-500',
    },
    disabled: {
      primary: 'opacity-50 cursor-not-allowed',
      secondary: 'opacity-50 cursor-not-allowed',
      success: 'opacity-50 cursor-not-allowed',
      warning: 'opacity-50 cursor-not-allowed',
      error: 'opacity-50 cursor-not-allowed',
      info: 'opacity-50 cursor-not-allowed',
      neutral: 'opacity-50 cursor-not-allowed',
    },
  },

  // Colores de superficie
  surface: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    tertiary: 'bg-gray-100 dark:bg-gray-700',
    quaternary: 'bg-gray-200 dark:bg-gray-600',
    overlay: 'bg-black/50 dark:bg-black/70',
    backdrop: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
  },

  // Colores de texto
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400',
    quaternary: 'text-gray-400 dark:text-gray-500',
    inverse: 'text-white dark:text-gray-900',
    disabled: 'text-gray-400 dark:text-gray-500',
    placeholder: 'text-gray-400 dark:text-gray-500',
  },

  // Colores de borde
  border: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600',
    tertiary: 'border-gray-400 dark:border-gray-500',
    focus: 'border-blue-500 dark:border-blue-400',
    error: 'border-red-500 dark:border-red-400',
    success: 'border-green-500 dark:border-green-400',
    warning: 'border-yellow-500 dark:border-yellow-400',
    info: 'border-cyan-500 dark:border-cyan-400',
  },

  /**
   * Opción única en grid (p. ej. check-in 1–5, feedback con iconos).
   * Ambos estados llevan relleno explícito (sin “solo borde” vs “bloque blanco” en oscuro).
   */
  interactiveOption: {
    default:
      'border border-slate-200 bg-slate-100/90 text-slate-800 transition-colors hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:border-slate-500',
    selected:
      'border-2 border-blue-500 bg-blue-50 text-blue-900 shadow-sm ring-2 ring-blue-500/20 transition-colors dark:border-blue-400 dark:bg-blue-950/55 dark:text-blue-50 dark:ring-blue-400/25',
  },

  // Colores de formularios
  forms: {
    input: {
      background: 'bg-white dark:bg-gray-900',
      text: 'text-gray-900 dark:text-white',
      border: 'border-gray-300 dark:border-gray-600',
      focus: {
        border: 'border-blue-500 dark:border-blue-400',
        ring: 'ring-2 ring-blue-500/20 dark:ring-blue-400/20',
      },
      error: {
        background: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-900 dark:text-red-100',
        border: 'border-red-300 dark:border-red-600',
      },
      disabled: {
        background: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-500 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700',
      },
    },
    label: {
      text: 'text-gray-700 dark:text-gray-300',
    },
    help: {
      text: 'text-gray-500 dark:text-gray-400',
    },
  },

  // Colores de alertas
  alerts: {
    info: {
      background: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-200 dark:border-blue-800',
    },
    success: {
      background: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800',
    },
    warning: {
      background: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    error: {
      background: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800',
    },
  },
} as const

// Función helper para obtener colores de una variante específica
export function getColorVariant(variant: keyof typeof semanticColors, shade?: string) {
  const colorMap = semanticColors[variant]
  if (!colorMap) return ''

  if (shade && typeof colorMap === 'object' && shade in colorMap) {
    return colorMap[shade as keyof typeof colorMap]
  }

  // Si no hay shade específico, devolver el 500 por defecto
  if (typeof colorMap === 'object' && '500' in colorMap) {
    return colorMap['500']
  }

  if (typeof colorMap === 'string') {
    return colorMap
  }
  return ''
}

// Función helper para obtener colores de estado
export function getStateColor(
  variant: keyof typeof semanticColors.state,
  type: keyof typeof semanticColors.state.hover,
) {
  const stateMap = semanticColors.state[variant]
  if (!stateMap) return ''

  return stateMap[type] ?? ''
}

// Función helper para obtener colores de superficie
export function getSurfaceColor(type: keyof typeof semanticColors.surface) {
  return semanticColors.surface[type] ?? ''
}

// Función helper para obtener colores de texto
export function getTextColor(type: keyof typeof semanticColors.text) {
  return semanticColors.text[type] ?? ''
}

// Función helper para obtener colores de borde
export function getBorderColor(type: keyof typeof semanticColors.border) {
  return semanticColors.border[type] ?? ''
}

/** Clases Tailwind para una tarjeta de opción (estado no seleccionado / seleccionado). */
export function getInteractiveOptionClasses(isSelected: boolean) {
  return isSelected
    ? semanticColors.interactiveOption.selected
    : semanticColors.interactiveOption.default
}

// Función helper para obtener colores de formularios
export function getFormColor(
  type: keyof typeof semanticColors.forms.input,
  variant?: string,
) {
  const formMap = semanticColors.forms.input[type]
  if (!formMap) return ''

  if (variant && typeof formMap === 'object' && variant in formMap) {
    return formMap[variant as keyof typeof formMap]
  }

  return formMap as string
}

// Función helper para obtener colores de alertas
export function getAlertColor(type: keyof typeof semanticColors.alerts) {
  return semanticColors.alerts[type] ?? ''
}

// Sistema de CSS Variables para colores
export const cssColorVariables = {
  // Colores primarios
  '--color-primary-50': '#eff6ff',
  '--color-primary-100': '#dbeafe',
  '--color-primary-200': '#bfdbfe',
  '--color-primary-300': '#93c5fd',
  '--color-primary-400': '#60a5fa',
  '--color-primary-500': '#3b82f6',
  '--color-primary-600': '#2563eb',
  '--color-primary-700': '#1d4ed8',
  '--color-primary-800': '#1e40af',
  '--color-primary-900': '#1e3a8a',
  '--color-primary-950': '#172554',

  // Colores de éxito
  '--color-success-50': '#f0fdf4',
  '--color-success-100': '#dcfce7',
  '--color-success-200': '#bbf7d0',
  '--color-success-300': '#86efac',
  '--color-success-400': '#4ade80',
  '--color-success-500': '#22c55e',
  '--color-success-600': '#16a34a',
  '--color-success-700': '#15803d',
  '--color-success-800': '#166534',
  '--color-success-900': '#14532d',
  '--color-success-950': '#052e16',

  // Colores de advertencia
  '--color-warning-50': '#fffbeb',
  '--color-warning-100': '#fef3c7',
  '--color-warning-200': '#fde68a',
  '--color-warning-300': '#fcd34d',
  '--color-warning-400': '#fbbf24',
  '--color-warning-500': '#f59e0b',
  '--color-warning-600': '#d97706',
  '--color-warning-700': '#b45309',
  '--color-warning-800': '#92400e',
  '--color-warning-900': '#78350f',
  '--color-warning-950': '#451a03',

  // Colores de error
  '--color-error-50': '#fef2f2',
  '--color-error-100': '#fee2e2',
  '--color-error-200': '#fecaca',
  '--color-error-300': '#fca5a5',
  '--color-error-400': '#f87171',
  '--color-error-500': '#ef4444',
  '--color-error-600': '#dc2626',
  '--color-error-700': '#b91c1c',
  '--color-error-800': '#991b1b',
  '--color-error-900': '#7f1d1d',
  '--color-error-950': '#450a0a',

  // Colores neutros
  '--color-neutral-50': '#f8fafc',
  '--color-neutral-100': '#f1f5f9',
  '--color-neutral-200': '#e2e8f0',
  '--color-neutral-300': '#cbd5e1',
  '--color-neutral-400': '#94a3b8',
  '--color-neutral-500': '#64748b',
  '--color-neutral-600': '#475569',
  '--color-neutral-700': '#334155',
  '--color-neutral-800': '#1e293b',
  '--color-neutral-900': '#0f172a',
  '--color-neutral-950': '#020617',

  // Colores de superficie
  '--color-surface-primary': '#ffffff',
  '--color-surface-secondary': '#f8fafc',
  '--color-surface-tertiary': '#f1f5f9',
  '--color-surface-overlay': 'rgba(0, 0, 0, 0.5)',
  '--color-surface-backdrop': 'rgba(255, 255, 255, 0.8)',

  // Colores de texto
  '--color-text-primary': '#0f172a',
  '--color-text-secondary': '#475569',
  '--color-text-tertiary': '#64748b',
  '--color-text-inverse': '#ffffff',
  '--color-text-disabled': '#94a3b8',

  // Colores de borde
  '--color-border-primary': '#e2e8f0',
  '--color-border-secondary': '#cbd5e1',
  '--color-border-focus': '#3b82f6',
  '--color-border-error': '#ef4444',
  '--color-border-success': '#22c55e',
  '--color-border-warning': '#f59e0b',
} as const

// Función para aplicar CSS variables al documento
export function applyColorVariables(): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  Object.entries(cssColorVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}

// Función para cambiar tema (light/dark)
export function setColorTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.theme = theme
  // Controles nativos (scrollbars, inputs) coherentes con el tema y mejora de UX
  root.style.setProperty('color-scheme', theme === 'dark' ? 'dark' : 'light')

  // Aplicar variables específicas del tema
  if (theme === 'dark') {
    root.style.setProperty('--color-surface-primary', '#0f172a')
    root.style.setProperty('--color-surface-secondary', '#1e293b')
    root.style.setProperty('--color-surface-tertiary', '#334155')
    root.style.setProperty('--color-text-primary', '#ffffff')
    root.style.setProperty('--color-text-secondary', '#cbd5e1')
    root.style.setProperty('--color-text-tertiary', '#94a3b8')
    root.style.setProperty('--color-border-primary', '#334155')
    root.style.setProperty('--color-border-secondary', '#475569')
  } else {
    root.style.setProperty('--color-surface-primary', '#ffffff')
    root.style.setProperty('--color-surface-secondary', '#f8fafc')
    root.style.setProperty('--color-surface-tertiary', '#f1f5f9')
    root.style.setProperty('--color-text-primary', '#0f172a')
    root.style.setProperty('--color-text-secondary', '#475569')
    root.style.setProperty('--color-text-tertiary', '#64748b')
    root.style.setProperty('--color-border-primary', '#e2e8f0')
    root.style.setProperty('--color-border-secondary', '#cbd5e1')
  }
}

// Exportar tipos para TypeScript
export type ColorVariant = keyof typeof semanticColors
export type ColorShade =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950'
export type StateType = keyof typeof semanticColors.state
export type SurfaceType = keyof typeof semanticColors.surface
export type TextType = keyof typeof semanticColors.text
export type BorderType = keyof typeof semanticColors.border
export type FormType = keyof typeof semanticColors.forms.input
export type AlertType = keyof typeof semanticColors.alerts
export type CSSColorVariable = keyof typeof cssColorVariables
