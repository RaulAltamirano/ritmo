// Tokens de Bordes y Sombras - Ritmo UI 2025
// Sistema centralizado para evitar duplicación entre componentes

export const borderTokens = {
  // Radios de borde
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Anchos de borde
  borderWidth: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },

  // Estilos de borde
  borderStyle: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double',
    none: 'none',
  },

  // Bordes específicos para componentes
  component: {
    button: {
      borderRadius: {
        xs: '0.25rem', // 4px
        sm: '0.375rem', // 6px
        md: '0.5rem', // 8px
        lg: '0.75rem', // 12px
        xl: '1rem', // 16px
      },
      borderWidth: {
        xs: '1px',
        sm: '1px',
        md: '1px',
        lg: '1px',
        xl: '1px',
      },
    },
    input: {
      borderRadius: {
        xs: '0.25rem', // 4px
        sm: '0.375rem', // 6px
        md: '0.5rem', // 8px
        lg: '0.75rem', // 12px
        xl: '1rem', // 16px
      },
      borderWidth: {
        xs: '1px',
        sm: '1px',
        md: '1px',
        lg: '1px',
        xl: '1px',
      },
    },
    card: {
      borderRadius: {
        sm: '0.5rem', // 8px
        md: '0.75rem', // 12px
        lg: '1rem', // 16px
      },
      borderWidth: {
        sm: '1px',
        md: '1px',
        lg: '1px',
      },
    },
    modal: {
      borderRadius: {
        sm: '0.75rem', // 12px
        md: '1rem', // 16px
        lg: '1.25rem', // 20px
        xl: '1.5rem', // 24px
      },
      borderWidth: {
        sm: '1px',
        md: '1px',
        lg: '1px',
        xl: '1px',
      },
    },
    badge: {
      borderRadius: {
        xs: '0.125rem', // 2px
        sm: '0.25rem', // 4px
        md: '0.375rem', // 6px
        lg: '0.5rem', // 8px
      },
      borderWidth: {
        xs: '1px',
        sm: '1px',
        md: '1px',
        lg: '1px',
      },
    },
  },
} as const

export const shadowTokens = {
  // Sombras base
  boxShadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Sombras específicas para componentes
  component: {
    button: {
      default: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      active: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    },
    card: {
      default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      elevated:
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    modal: {
      default: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      backdrop: '0 0 0 1000px rgba(0, 0, 0, 0.5)',
    },
    input: {
      default: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
      error: '0 0 0 3px rgba(239, 68, 68, 0.5)',
      success: '0 0 0 3px rgba(16, 185, 129, 0.5)',
    },
    dropdown: {
      default:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    tooltip: {
      default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
  },

  // Sombras para estados especiales
  state: {
    focus: {
      primary: '0 0 0 3px rgba(59, 130, 246, 0.5)',
      success: '0 0 0 3px rgba(16, 185, 129, 0.5)',
      warning: '0 0 0 3px rgba(245, 158, 11, 0.5)',
      error: '0 0 0 3px rgba(239, 68, 68, 0.5)',
      info: '0 0 0 3px rgba(6, 182, 212, 0.5)',
    },
    hover: {
      light: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      heavy:
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    active: {
      light: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      medium: 'inset 0 4px 6px 0 rgba(0, 0, 0, 0.1)',
    },
  },

  // Sombras para efectos especiales
  effects: {
    glow: {
      primary: '0 0 20px rgba(59, 130, 246, 0.3)',
      success: '0 0 20px rgba(16, 185, 129, 0.3)',
      warning: '0 0 20px rgba(245, 158, 11, 0.3)',
      error: '0 0 20px rgba(239, 68, 68, 0.3)',
      info: '0 0 20px rgba(6, 182, 212, 0.3)',
    },
    blur: {
      light: '0 8px 32px rgba(0, 0, 0, 0.1)',
      medium: '0 16px 64px rgba(0, 0, 0, 0.15)',
      heavy: '0 32px 128px rgba(0, 0, 0, 0.2)',
    },
    depth: {
      shallow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      medium: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
      deep: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    },
  },
} as const

// Función helper para obtener radio de borde
export function getBorderRadius(size: keyof typeof borderTokens.borderRadius): string {
  return borderTokens.borderRadius[size] || borderTokens.borderRadius.base
}

// Función helper para obtener ancho de borde
export function getBorderWidth(width: keyof typeof borderTokens.borderWidth): string {
  return borderTokens.borderWidth[width] || borderTokens.borderWidth[1]
}

// Función helper para obtener estilo de borde
export function getBorderStyle(style: keyof typeof borderTokens.borderStyle): string {
  return borderTokens.borderStyle[style] || borderTokens.borderStyle.solid
}

// Función helper para obtener radio de borde de componente
export function getComponentBorderRadius(component: string, size: string): string {
  const componentTokens =
    borderTokens.component[component as keyof typeof borderTokens.component]
  if (!componentTokens) return borderTokens.borderRadius.base

  return (
    componentTokens.borderRadius[size as keyof typeof componentTokens.borderRadius] ||
    borderTokens.borderRadius.base
  )
}

// Función helper para obtener ancho de borde de componente
export function getComponentBorderWidth(component: string, size: string): string {
  const componentTokens =
    borderTokens.component[component as keyof typeof borderTokens.component]
  if (!componentTokens) return borderTokens.borderWidth[1]

  return (
    componentTokens.borderWidth[size as keyof typeof componentTokens.borderWidth] ||
    borderTokens.borderWidth[1]
  )
}

// Función helper para obtener sombra
export function getBoxShadow(size: keyof typeof shadowTokens.boxShadow): string {
  return shadowTokens.boxShadow[size] || shadowTokens.boxShadow.none
}

// Función helper para obtener sombra de componente
export function getComponentShadow(component: string, state: string): string {
  const componentTokens =
    shadowTokens.component[component as keyof typeof shadowTokens.component]
  if (!componentTokens) return shadowTokens.boxShadow.none

  return (
    componentTokens[state as keyof typeof componentTokens] ||
    shadowTokens.boxShadow.none
  )
}

// Función helper para obtener sombra de estado
export function getStateShadow(type: string, state: string): string {
  const stateTokens = shadowTokens.state[type as keyof typeof shadowTokens.state]
  if (!stateTokens) return shadowTokens.boxShadow.none

  return stateTokens[state as keyof typeof stateTokens] || shadowTokens.boxShadow.none
}

// Función helper para obtener sombra de efecto
export function getEffectShadow(type: string, variant: string): string {
  const effectTokens = shadowTokens.effects[type as keyof typeof shadowTokens.effects]
  if (!effectTokens) return shadowTokens.boxShadow.none

  return (
    effectTokens[variant as keyof typeof effectTokens] || shadowTokens.boxShadow.none
  )
}

// Exportar tipos para TypeScript
export type BorderRadius = keyof typeof borderTokens.borderRadius
export type BorderWidth = keyof typeof borderTokens.borderWidth
export type BorderStyle = keyof typeof borderTokens.borderStyle
export type ComponentBorder = keyof typeof borderTokens.component
export type BoxShadow = keyof typeof shadowTokens.boxShadow
export type ComponentShadow = keyof typeof shadowTokens.component
export type StateShadow = keyof typeof shadowTokens.state
export type EffectShadow = keyof typeof shadowTokens.effects
