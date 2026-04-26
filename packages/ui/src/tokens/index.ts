// Sistema de Tokens Unificado - Ritmo UI 2025
// Exporta todos los tokens del sistema de diseño de manera centralizada

// Tokens de tamaños
import { componentSizes } from './sizes'
export {
  componentSizes,
  getAvailableSizes,
  getComponentSize,
  getDefaultSize,
  isValidSize,
} from './sizes'
export type {
  AlertSize,
  BadgeSize,
  ButtonSize,
  CardSize,
  ComponentSize,
  IconSize,
  InputSize,
  ModalSize,
  SkeletonSize,
  SpinnerSize,
  ToastSize,
} from './sizes'

// Tokens de colores
import { semanticColors, setColorTheme } from './colors'
export {
  applyColorVariables,
  cssColorVariables,
  getAlertColor,
  getBorderColor,
  getColorVariant,
  getFormColor,
  getInteractiveOptionClasses,
  getStateColor,
  getSurfaceColor,
  getTextColor,
  semanticColors,
  setColorTheme,
} from './colors'
export type {
  AlertType,
  BorderType,
  CSSColorVariable,
  ColorShade,
  ColorVariant,
  FormType,
  StateType,
  SurfaceType,
  TextType,
} from './colors'

// Tokens de espaciado
import { spacingTokens } from './spacing'
export {
  getComponentSpacing,
  getLayoutSpacing,
  getSpacing,
  spacingTokens,
} from './spacing'
export type {
  ComponentSpacing,
  LayoutSpacing,
  SpacingToken,
  TypographySpacing,
} from './spacing'

// Tokens de tipografía
import { typographyTokens } from './typography'
export {
  getComponentTypography,
  getComponentTypographyClasses,
  getFontFamily,
  getFontSize,
  getFontWeight,
  getLetterSpacing,
  getLineHeight,
  getTextStyle,
  getTypographyClasses,
  typographyTokens,
} from './typography'
export type {
  ComponentTypography,
  FontFamily,
  FontSize,
  FontWeight,
  LetterSpacing,
  LineHeight,
  TextStyle,
} from './typography'

// Tokens de bordes y sombras
import { borderTokens, shadowTokens } from './borders'
export {
  borderTokens,
  getBorderRadius,
  getBorderStyle,
  getBorderWidth,
  getBoxShadow,
  getComponentBorderRadius,
  getComponentBorderWidth,
  getComponentShadow,
  getEffectShadow,
  getStateShadow,
  shadowTokens,
} from './borders'
export type {
  BorderRadius,
  BorderStyle,
  BorderWidth,
  BoxShadow,
  ComponentBorder,
  ComponentShadow,
  EffectShadow,
  StateShadow,
} from './borders'

// Variables CSS centralizadas
import { applyAllCSSVariables } from './css-variables'
export {
  applyAllCSSVariables,
  applyTypographyCSSVariables,
  cssBorderVariables,
  cssShadowVariables,
  cssSpacingVariables,
  cssTypographyVariables,
  getAllCSSVariables,
} from './css-variables'
export type {
  CSSBorderVariable,
  CSSShadowVariable,
  CSSSpacingVariable,
  CSSTypographyVariable,
} from './css-variables'

// Función para obtener todos los tokens
export function getAllTokens() {
  return {
    sizes: componentSizes,
    colors: semanticColors,
    spacing: spacingTokens,
    typography: typographyTokens,
    borders: borderTokens,
    shadows: shadowTokens,
  }
}

// Función para validar tokens
export function validateTokens(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validar que todos los tokens existan
  if (!componentSizes) errors.push('componentSizes no está definido')
  if (!semanticColors) errors.push('semanticColors no está definido')
  if (!spacingTokens) errors.push('spacingTokens no está definido')
  if (!typographyTokens) errors.push('typographyTokens no está definido')
  if (!borderTokens) errors.push('borderTokens no está definido')
  if (!shadowTokens) errors.push('shadowTokens no está definido')

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Función para aplicar todos los tokens al documento
export function applyAllTokens(): void {
  try {
    // Aplicar variables CSS centralizadas
    applyAllCSSVariables()

    // Aplicar tema del sistema
    if (globalThis.window !== undefined) {
      const prefersDark = globalThis.window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches
      setColorTheme(prefersDark ? 'dark' : 'light')
    }
  } catch {
    // No-op: token application failures should not crash host apps.
  }
}

export interface InitializeDesignSystemOptions {
  /**
   * Cuando es false, no se suscribe a `prefers-color-scheme` (p. ej. Storybook,
   * donde el tema lo controla el lienzo vía clases en `<html>`).
   * @default true
   */
  subscribeToSystemThemeChanges?: boolean
}

// Función para inicializar el sistema de tokens automáticamente
export function initializeDesignSystem(options?: InitializeDesignSystemOptions): void {
  const subscribeToSystemThemeChanges = options?.subscribeToSystemThemeChanges !== false

  try {
    // Aplicar tokens al inicio
    applyAllTokens()

    // Configurar listener para cambios de tema del SO (no mezclar con tema forzado en Storybook)
    if (subscribeToSystemThemeChanges && globalThis.window !== undefined) {
      const mediaQuery = globalThis.window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', e => {
        setColorTheme(e.matches ? 'dark' : 'light')
      })
    }
  } catch {
    // No-op: initialization errors should be handled by host apps if needed.
  }
}

// Función para validar que todos los tokens estén aplicados
export function validateTokensApplied(): boolean {
  if (globalThis.document === undefined) return false

  const root = document.documentElement
  const requiredVars = [
    '--font-size-base',
    '--font-weight-normal',
    '--line-height-normal',
    '--color-primary-500',
    '--spacing-4',
  ]

  return requiredVars.every(varName => {
    const value = globalThis.getComputedStyle(root).getPropertyValue(varName)
    return value && value.trim() !== ''
  })
}

// Función para obtener información del sistema de tokens
export function getTokensInfo() {
  return {
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    totalTokens: {
      sizes: Object.keys(componentSizes).length,
      colors: Object.keys(semanticColors).length,
      spacing: Object.keys(spacingTokens).length,
      typography: Object.keys(typographyTokens).length,
      borders: Object.keys(borderTokens).length,
      shadows: Object.keys(shadowTokens).length,
    },
    features: {
      cssVariables: true,
      themeSwitching: true,
      accessibility: true,
      responsive: true,
      darkMode: true,
    },
  }
}

// Exportar por defecto
export default {
  getAllTokens,
  validateTokens,
  applyAllTokens,
  getTokensInfo,
  tokens: {
    sizes: componentSizes,
    colors: semanticColors,
    spacing: spacingTokens,
    typography: typographyTokens,
    borders: borderTokens,
    shadows: shadowTokens,
  },
}
