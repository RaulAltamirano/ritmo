// Variables CSS Centralizadas - Ritmo UI 2025
// Sistema unificado para todas las variables CSS del sistema de diseño

import { cssColorVariables } from './colors'
import { spacingTokens } from './spacing'
import { typographyTokens } from './typography'

// Variables CSS de tipografía
export const cssTypographyVariables = {
  // Tamaños de fuente
  '--font-size-xs': typographyTokens.fontSize.xs,
  '--font-size-sm': typographyTokens.fontSize.sm,
  '--font-size-base': typographyTokens.fontSize.base,
  '--font-size-lg': typographyTokens.fontSize.lg,
  '--font-size-xl': typographyTokens.fontSize.xl,
  '--font-size-2xl': typographyTokens.fontSize['2xl'],
  '--font-size-3xl': typographyTokens.fontSize['3xl'],
  '--font-size-4xl': typographyTokens.fontSize['4xl'],
  '--font-size-5xl': typographyTokens.fontSize['5xl'],
  '--font-size-6xl': typographyTokens.fontSize['6xl'],
  '--font-size-7xl': typographyTokens.fontSize['7xl'],
  '--font-size-8xl': typographyTokens.fontSize['8xl'],
  '--font-size-9xl': typographyTokens.fontSize['9xl'],

  // Pesos de fuente
  '--font-weight-thin': typographyTokens.fontWeight.thin,
  '--font-weight-extralight': typographyTokens.fontWeight.extralight,
  '--font-weight-light': typographyTokens.fontWeight.light,
  '--font-weight-normal': typographyTokens.fontWeight.normal,
  '--font-weight-medium': typographyTokens.fontWeight.medium,
  '--font-weight-semibold': typographyTokens.fontWeight.semibold,
  '--font-weight-bold': typographyTokens.fontWeight.bold,
  '--font-weight-extrabold': typographyTokens.fontWeight.extrabold,
  '--font-weight-black': typographyTokens.fontWeight.black,

  // Alturas de línea
  '--line-height-none': typographyTokens.lineHeight.none,
  '--line-height-tight': typographyTokens.lineHeight.tight,
  '--line-height-snug': typographyTokens.lineHeight.snug,
  '--line-height-normal': typographyTokens.lineHeight.normal,
  '--line-height-relaxed': typographyTokens.lineHeight.relaxed,
  '--line-height-loose': typographyTokens.lineHeight.loose,

  // Espaciado de letras
  '--letter-spacing-tighter': typographyTokens.letterSpacing.tighter,
  '--letter-spacing-tight': typographyTokens.letterSpacing.tight,
  '--letter-spacing-normal': typographyTokens.letterSpacing.normal,
  '--letter-spacing-wide': typographyTokens.letterSpacing.wide,
  '--letter-spacing-wider': typographyTokens.letterSpacing.wider,
  '--letter-spacing-widest': typographyTokens.letterSpacing.widest,

  // Familias de fuente
  '--font-family-sans': typographyTokens.fontFamily.sans.join(', '),
  '--font-family-serif': typographyTokens.fontFamily.serif.join(', '),
  '--font-family-mono': typographyTokens.fontFamily.mono.join(', '),
  '--font-family-display': typographyTokens.fontFamily.display.join(', '),
} as const

// Variables CSS de espaciado
export const cssSpacingVariables = {
  '--spacing-xs': spacingTokens.xs,
  '--spacing-sm': spacingTokens.sm,
  '--spacing-md': spacingTokens.md,
  '--spacing-lg': spacingTokens.lg,
  '--spacing-xl': spacingTokens.xl,
  '--spacing-2xl': spacingTokens['2xl'],
  '--spacing-3xl': spacingTokens['3xl'],
  '--spacing-4xl': spacingTokens['4xl'],
  '--spacing-5xl': spacingTokens['5xl'],
  '--spacing-0': '0px',
  '--spacing-1': '0.25rem',
  '--spacing-2': '0.5rem',
  '--spacing-3': '0.75rem',
  '--spacing-4': '1rem',
  '--spacing-5': '1.25rem',
  '--spacing-6': '1.5rem',
  '--spacing-8': '2rem',
  '--spacing-10': '2.5rem',
  '--spacing-12': '3rem',
  '--spacing-16': '4rem',
  '--spacing-20': '5rem',
  '--spacing-24': '6rem',
  '--spacing-32': '8rem',
  '--spacing-40': '10rem',
  '--spacing-48': '12rem',
  '--spacing-56': '14rem',
  '--spacing-64': '16rem',
} as const

// Variables CSS de bordes
export const cssBorderVariables = {
  '--border-radius-none': '0px',
  '--border-radius-sm': '0.125rem',
  '--border-radius-base': '0.25rem',
  '--border-radius-md': '0.375rem',
  '--border-radius-lg': '0.5rem',
  '--border-radius-xl': '0.75rem',
  '--border-radius-2xl': '1rem',
  '--border-radius-3xl': '1.5rem',
  '--border-radius-full': '9999px',

  '--border-width-0': '0px',
  '--border-width-1': '1px',
  '--border-width-2': '2px',
  '--border-width-4': '4px',
  '--border-width-8': '8px',
} as const

// Variables CSS de sombras
export const cssShadowVariables = {
  '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  '--shadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  '--shadow-md':
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  '--shadow-lg':
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  '--shadow-xl':
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '--shadow-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '--shadow-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const

// Función para aplicar todas las variables CSS
export function applyAllCSSVariables(): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Aplicar variables de colores
  Object.entries(cssColorVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

  // Aplicar variables de tipografía
  Object.entries(cssTypographyVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

  // Aplicar variables de espaciado
  Object.entries(cssSpacingVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

  // Aplicar variables de bordes
  Object.entries(cssBorderVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

  // Aplicar variables de sombras
  Object.entries(cssShadowVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

}

// Función para aplicar solo variables de tipografía
export function applyTypographyCSSVariables(): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  Object.entries(cssTypographyVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

}

// Función para obtener todas las variables CSS
export function getAllCSSVariables() {
  return {
    colors: cssColorVariables,
    typography: cssTypographyVariables,
    spacing: cssSpacingVariables,
    borders: cssBorderVariables,
    shadows: cssShadowVariables,
  }
}

// Exportar tipos
export type CSSTypographyVariable = keyof typeof cssTypographyVariables
export type CSSSpacingVariable = keyof typeof cssSpacingVariables
export type CSSBorderVariable = keyof typeof cssBorderVariables
export type CSSShadowVariable = keyof typeof cssShadowVariables
