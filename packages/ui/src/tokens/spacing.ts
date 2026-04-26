// Tokens de Espaciado - Ritmo UI 2025
// Sistema centralizado para evitar duplicación entre componentes

export const spacingTokens = {
  // Espaciado base (4px grid system)
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
  '5xl': '8rem', // 128px

  // Espaciado específico para componentes
  component: {
    button: {
      padding: {
        xs: '0.5rem 1rem', // 8px 16px
        sm: '0.75rem 1.5rem', // 12px 24px
        md: '1rem 2rem', // 16px 32px
        lg: '1.25rem 2.5rem', // 20px 40px
        xl: '1.5rem 3rem', // 24px 48px
      },
      gap: {
        xs: '0.25rem', // 4px
        sm: '0.5rem', // 8px
        md: '0.75rem', // 12px
        lg: '1rem', // 16px
        xl: '1.25rem', // 20px
      },
    },
    input: {
      padding: {
        xs: '0.5rem 0.75rem', // 8px 12px
        sm: '0.75rem 1rem', // 12px 16px
        md: '1rem 1.25rem', // 16px 20px
        lg: '1.25rem 1.5rem', // 20px 24px
        xl: '1.5rem 1.75rem', // 24px 28px
      },
      margin: {
        xs: '0.25rem', // 4px
        sm: '0.5rem', // 8px
        md: '0.75rem', // 12px
        lg: '1rem', // 16px
        xl: '1.25rem', // 20px
      },
    },
    card: {
      padding: {
        sm: '1rem', // 16px
        md: '1.5rem', // 24px
        lg: '2rem', // 32px
      },
      margin: {
        sm: '0.5rem', // 8px
        md: '1rem', // 16px
        lg: '1.5rem', // 24px
      },
    },
    modal: {
      padding: {
        sm: '1.5rem', // 24px
        md: '2rem', // 32px
        lg: '2.5rem', // 40px
        xl: '3rem', // 48px
      },
      margin: {
        sm: '1rem', // 16px
        md: '1.5rem', // 24px
        lg: '2rem', // 32px
        xl: '2.5rem', // 40px
      },
    },
  },

  // Espaciado para layouts
  layout: {
    container: {
      padding: {
        xs: '1rem', // 16px
        sm: '1.5rem', // 24px
        md: '2rem', // 32px
        lg: '3rem', // 48px
        xl: '4rem', // 64px
      },
      maxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '7xl': '80rem', // 1280px
      },
    },
    section: {
      padding: {
        xs: '2rem 0', // 32px 0
        sm: '3rem 0', // 48px 0
        md: '4rem 0', // 64px 0
        lg: '6rem 0', // 96px 0
        xl: '8rem 0', // 128px 0
      },
      margin: {
        xs: '1rem 0', // 16px 0
        sm: '1.5rem 0', // 24px 0
        md: '2rem 0', // 32px 0
        lg: '3rem 0', // 48px 0
        xl: '4rem 0', // 64px 0
      },
    },
    grid: {
      gap: {
        xs: '0.5rem', // 8px
        sm: '1rem', // 16px
        md: '1.5rem', // 24px
        lg: '2rem', // 32px
        xl: '3rem', // 48px
      },
    },
  },

  // Espaciado para tipografía
  typography: {
    lineHeight: {
      tight: '1.25', // 20px para 16px base
      normal: '1.5', // 24px para 16px base
      relaxed: '1.75', // 28px para 16px base
      loose: '2', // 32px para 16px base
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    paragraph: {
      margin: {
        top: '0',
        bottom: '1rem', // 16px
      },
    },
    heading: {
      margin: {
        top: '0',
        bottom: '0.5rem', // 8px
      },
    },
  },
} as const

// Función helper para obtener espaciado
export function getSpacing(type: keyof typeof spacingTokens, variant?: string): string {
  if (variant && type in spacingTokens && typeof spacingTokens[type] === 'object') {
    const typeTokens = spacingTokens[type] as Record<string, any>
    return typeTokens[variant] ?? spacingTokens.md
  }

  if (type in spacingTokens) {
    return spacingTokens[type] as string
  }

  return spacingTokens.md
}

// Función helper para obtener espaciado de componente
export function getComponentSpacing(
  component: string,
  property: string,
  size: string,
): string {
  const componentTokens =
    spacingTokens.component[component as keyof typeof spacingTokens.component]
  if (!componentTokens) return spacingTokens.md

  const propertyTokens = componentTokens[property as keyof typeof componentTokens]
  if (!propertyTokens) return spacingTokens.md

  return propertyTokens[size as keyof typeof propertyTokens] || spacingTokens.md
}

// Función helper para obtener espaciado de layout
export function getLayoutSpacing(type: string, property: string, size: string): string {
  const layoutTokens = spacingTokens.layout[type as keyof typeof spacingTokens.layout]
  if (!layoutTokens) return spacingTokens.md

  const propertyTokens = layoutTokens[property as keyof typeof layoutTokens]
  if (!propertyTokens) return spacingTokens.md

  return propertyTokens[size as keyof typeof propertyTokens] || spacingTokens.md
}

// Exportar tipos para TypeScript
export type SpacingToken = keyof typeof spacingTokens
export type ComponentSpacing = keyof typeof spacingTokens.component
export type LayoutSpacing = keyof typeof spacingTokens.layout
export type TypographySpacing = keyof typeof spacingTokens.typography
