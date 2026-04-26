// Tokens de Tipografía - Ritmo UI 2025
// Sistema centralizado para evitar duplicación entre componentes

export const typographyTokens = {
  // Escalas de tamaño de fuente
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  },

  // Pesos de fuente
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Alturas de línea
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Espaciado entre letras
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Familias de fuente
  fontFamily: {
    sans: [
      'Plus Jakarta Sans',
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'Noto Sans',
      'sans-serif',
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
      'Noto Color Emoji',
    ],
    serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    mono: [
      'JetBrains Mono',
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
    display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },

  // Estilos de texto predefinidos
  textStyles: {
    // Estilos para headings - Actualizados para mayor impacto visual
    h1: {
      fontSize: '3rem', // 48px (era 36px)
      fontWeight: '700',
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem', // 36px (era 30px)
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem', // 30px (era 24px)
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.5rem', // 24px (era 20px)
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    h5: {
      fontSize: '1.25rem', // 20px (era 18px)
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1.125rem', // 18px (era 16px)
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },

    // Estilos para display - Títulos más impactantes como en landing page
    display: {
      fontSize: '3.75rem', // 60px
      fontWeight: '700',
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
    },
    'display-large': {
      fontSize: '4.5rem', // 72px
      fontWeight: '700',
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
    },
    'display-xl': {
      fontSize: '6rem', // 96px
      fontWeight: '700',
      lineHeight: '1',
      letterSpacing: '-0.025em',
    },

    // Estilos para body text - Actualizados para mejor proporción
    body: {
      fontSize: '1.125rem', // 18px (era 16px)
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0em',
    },
    'body-large': {
      fontSize: '1.25rem', // 20px (era 18px)
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0em',
    },
    'body-small': {
      fontSize: '1rem', // 16px (era 14px)
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },

    // Estilos para captions
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: '400',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },
    'caption-large': {
      fontSize: '0.875rem', // 14px
      fontWeight: '400',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },

    // Estilos para código
    code: {
      fontSize: '0.875rem', // 14px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
      fontFamily: 'mono',
    },
    'code-large': {
      fontSize: '1rem', // 16px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
      fontFamily: 'mono',
    },

    // Estilos para botones
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },
    'button-large': {
      fontSize: '1rem', // 16px
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },
    'button-small': {
      fontSize: '0.75rem', // 12px
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },

    // Estilos para labels
    label: {
      fontSize: '0.875rem', // 14px
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },
    'label-small': {
      fontSize: '0.75rem', // 12px
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },
  },

  // Estilos específicos para componentes
  component: {
    button: {
      xs: {
        fontSize: '0.75rem', // 12px
        fontWeight: '500',
        lineHeight: '1.4',
        letterSpacing: '0.025em',
      },
      sm: {
        fontSize: '0.875rem', // 14px
        fontWeight: '500',
        lineHeight: '1.4',
        letterSpacing: '0.025em',
      },
      md: {
        fontSize: '0.875rem', // 14px
        fontWeight: '500',
        lineHeight: '1.4',
        letterSpacing: '0.025em',
      },
      lg: {
        fontSize: '1rem', // 16px
        fontWeight: '500',
        lineHeight: '1.4',
        letterSpacing: '0.025em',
      },
      xl: {
        fontSize: '1rem', // 16px
        fontWeight: '500',
        lineHeight: '1.4',
        letterSpacing: '0.025em',
      },
    },
    input: {
      xs: {
        fontSize: '0.75rem', // 12px
        fontWeight: '400',
        lineHeight: '1.4',
        letterSpacing: '0em',
      },
      sm: {
        fontSize: '0.875rem', // 14px
        fontWeight: '400',
        lineHeight: '1.4',
        letterSpacing: '0em',
      },
      md: {
        fontSize: '0.875rem', // 14px
        fontWeight: '400',
        lineHeight: '1.4',
        letterSpacing: '0em',
      },
      lg: {
        fontSize: '1rem', // 16px
        fontWeight: '400',
        lineHeight: '1.4',
        letterSpacing: '0em',
      },
      xl: {
        fontSize: '1rem', // 16px
        fontWeight: '400',
        lineHeight: '1.4',
        letterSpacing: '0em',
      },
    },
    badge: {
      xs: {
        fontSize: '0.625rem', // 10px
        fontWeight: '500',
        lineHeight: '1.2',
        letterSpacing: '0.025em',
      },
      sm: {
        fontSize: '0.75rem', // 12px
        fontWeight: '500',
        lineHeight: '1.2',
        letterSpacing: '0.025em',
      },
      md: {
        fontSize: '0.875rem', // 14px
        fontWeight: '500',
        lineHeight: '1.2',
        letterSpacing: '0.025em',
      },
      lg: {
        fontSize: '0.875rem', // 14px
        fontWeight: '500',
        lineHeight: '1.2',
        letterSpacing: '0.025em',
      },
    },
  },
} as const

// Función helper para obtener tamaño de fuente
export function getFontSize(size: keyof typeof typographyTokens.fontSize): string {
  return typographyTokens.fontSize[size] || typographyTokens.fontSize.base
}

// Función helper para obtener peso de fuente
export function getFontWeight(
  weight: keyof typeof typographyTokens.fontWeight,
): string {
  return typographyTokens.fontWeight[weight] || typographyTokens.fontWeight.normal
}

// Función helper para obtener altura de línea
export function getLineHeight(
  height: keyof typeof typographyTokens.lineHeight,
): string {
  return typographyTokens.lineHeight[height] || typographyTokens.lineHeight.normal
}

// Función helper para obtener espaciado de letras
export function getLetterSpacing(
  spacing: keyof typeof typographyTokens.letterSpacing,
): string {
  return (
    typographyTokens.letterSpacing[spacing] || typographyTokens.letterSpacing.normal
  )
}

// Función helper para obtener estilo de texto
export function getTextStyle(
  style: keyof typeof typographyTokens.textStyles,
): Record<string, string> {
  return typographyTokens.textStyles[style] || typographyTokens.textStyles.body
}

// Función helper para obtener tipografía de componente
export function getComponentTypography(
  component: string,
  size: string,
): Record<string, string> {
  const componentTokens =
    typographyTokens.component[component as keyof typeof typographyTokens.component]
  if (!componentTokens) return typographyTokens.textStyles.body

  return (
    componentTokens[size as keyof typeof componentTokens] ||
    typographyTokens.textStyles.body
  )
}

// Función helper para obtener clases CSS de tipografía
export function getTypographyClasses(
  style: keyof typeof typographyTokens.textStyles,
): string {
  const textStyle = getTextStyle(style)
  return `text-[${textStyle.fontSize}] font-[${textStyle.fontWeight}] leading-[${textStyle.lineHeight}] tracking-[${textStyle.letterSpacing}]`
}

// Función helper para obtener clases CSS de componente
export function getComponentTypographyClasses(component: string, size: string): string {
  const componentStyle = getComponentTypography(component, size)
  return `text-[${componentStyle.fontSize}] font-[${componentStyle.fontWeight}] leading-[${componentStyle.lineHeight}] tracking-[${componentStyle.letterSpacing}]`
}

// Función helper para obtener familia de fuente
export function getFontFamily(
  family: keyof typeof typographyTokens.fontFamily,
): string {
  return typographyTokens.fontFamily[family].join(', ')
}

// Exportar tipos para TypeScript
export type FontSize = keyof typeof typographyTokens.fontSize
export type FontWeight = keyof typeof typographyTokens.fontWeight
export type LineHeight = keyof typeof typographyTokens.lineHeight
export type LetterSpacing = keyof typeof typographyTokens.letterSpacing
export type FontFamily = keyof typeof typographyTokens.fontFamily
export type TextStyle = keyof typeof typographyTokens.textStyles
export type ComponentTypography = keyof typeof typographyTokens.component
