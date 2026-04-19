import { describe, expect, it } from 'vitest'
import { borderTokens } from '../src/tokens/borders'
import { colorTokens, semanticColors } from '../src/tokens/colors'
import { shadowTokens } from '../src/tokens/shadows'
import { sizeTokens } from '../src/tokens/sizes'
import { spacingTokens } from '../src/tokens/spacing'
import { typographyTokens } from '../src/tokens/typography'

describe('Design System Tokens', () => {
  describe('Typography Tokens', () => {
    it('should have valid font sizes', () => {
      const fontSizes = typographyTokens.fontSize

      expect(fontSizes).toBeDefined()
      expect(typeof fontSizes).toBe('object')

      // Verificar que todos los tamaños son strings válidos
      Object.values(fontSizes).forEach(size => {
        expect(typeof size).toBe('string')
        expect(size).toMatch(/^\d+(\.\d+)?rem$/)
      })
    })

    it('should have valid font weights', () => {
      const fontWeights = typographyTokens.fontWeight

      expect(fontWeights).toBeDefined()
      expect(typeof fontWeights).toBe('object')

      // Verificar que todos los pesos son strings válidos
      Object.values(fontWeights).forEach(weight => {
        expect(typeof weight).toBe('string')
        expect(weight).toMatch(/^\d{3}$/)
      })
    })

    it('should have valid line heights', () => {
      const lineHeights = typographyTokens.lineHeight

      expect(lineHeights).toBeDefined()
      expect(typeof lineHeights).toBe('object')

      // Verificar que todas las alturas son strings válidos
      Object.values(lineHeights).forEach(height => {
        expect(typeof height).toBe('string')
        expect(height).toMatch(/^\d+(\.\d+)?$/)
      })
    })

    it('should have valid component typography', () => {
      const componentTypography = typographyTokens.component

      expect(componentTypography).toBeDefined()
      expect(componentTypography.button).toBeDefined()
      expect(componentTypography.input).toBeDefined()
      expect(componentTypography.badge).toBeDefined()

      // Verificar estructura de button typography
      Object.values(componentTypography.button).forEach(buttonStyle => {
        expect(buttonStyle).toHaveProperty('fontSize')
        expect(buttonStyle).toHaveProperty('fontWeight')
        expect(buttonStyle).toHaveProperty('lineHeight')
        expect(buttonStyle).toHaveProperty('letterSpacing')
      })
    })
  })

  describe('Color Tokens', () => {
    it('should have valid semantic colors', () => {
      expect(semanticColors).toBeDefined()
      expect(typeof semanticColors).toBe('object')

      // Verificar que todos los colores son hex válidos
      Object.values(semanticColors).forEach(color => {
        expect(typeof color).toBe('string')
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      })
    })

    it('should have valid color scales', () => {
      expect(colorTokens).toBeDefined()
      expect(typeof colorTokens).toBe('object')

      // Verificar estructura de escalas de color
      Object.keys(colorTokens).forEach(variant => {
        const scale = colorTokens[variant]
        expect(typeof scale).toBe('object')

        // Verificar que cada escala tiene tonos del 50 al 900
        Object.keys(scale).forEach(tono => {
          expect(tono).toMatch(/^\d{2,3}$/)
          const tonoNum = parseInt(tono)
          expect(tonoNum).toBeGreaterThanOrEqual(50)
          expect(tonoNum).toBeLessThanOrEqual(900)
          expect(tonoNum % 50 === 0 || tonoNum % 100 === 0).toBe(true)
        })
      })
    })

    it('should have consistent color structure', () => {
      const variants = Object.keys(colorTokens)

      // Verificar que todos los variants tienen la misma estructura
      variants.forEach(variant => {
        const scale = colorTokens[variant]
        const expectedTones = [
          '50',
          '100',
          '200',
          '300',
          '400',
          '500',
          '600',
          '700',
          '800',
          '900',
        ]

        expectedTones.forEach(tone => {
          expect(scale).toHaveProperty(tone)
          expect(typeof scale[tone]).toBe('string')
          expect(scale[tone]).toMatch(/^#[0-9A-Fa-f]{6}$/)
        })
      })
    })
  })

  describe('Spacing Tokens', () => {
    it('should have valid spacing values', () => {
      expect(spacingTokens).toBeDefined()
      expect(typeof spacingTokens).toBe('object')

      // Verificar que todos los espaciados son strings válidos
      Object.values(spacingTokens).forEach(spacing => {
        expect(typeof spacing).toBe('string')
        expect(spacing).toMatch(/^\d+(\.\d+)?rem$/)
      })
    })

    it('should have consistent spacing scale', () => {
      const spacingValues = Object.values(spacingTokens).map(s => parseFloat(s))

      // Verificar que los valores son crecientes
      for (let i = 1; i < spacingValues.length; i++) {
        expect(spacingValues[i]).toBeGreaterThan(spacingValues[i - 1])
      }
    })
  })

  describe('Border Tokens', () => {
    it('should have valid border radius values', () => {
      expect(borderTokens.radius).toBeDefined()
      expect(typeof borderTokens.radius).toBe('object')

      Object.values(borderTokens.radius).forEach(radius => {
        expect(typeof radius).toBe('string')
        expect(radius).toMatch(/^\d+(\.\d+)?(rem|px)$/)
      })
    })

    it('should have valid border width values', () => {
      expect(borderTokens.width).toBeDefined()
      expect(typeof borderTokens.width).toBe('object')

      Object.values(borderTokens.width).forEach(width => {
        expect(typeof width).toBe('string')
        expect(width).toMatch(/^\d+(\.\d+)?(rem|px)$/)
      })
    })
  })

  describe('Shadow Tokens', () => {
    it('should have valid shadow values', () => {
      expect(shadowTokens).toBeDefined()
      expect(typeof shadowTokens).toBe('object')

      Object.values(shadowTokens).forEach(shadow => {
        expect(typeof shadow).toBe('string')
        // Verificar que es una sombra válida (puede ser 'none' o una sombra CSS)
        expect(
          shadow === 'none' || shadow.includes('rgba') || shadow.includes('rgb'),
        ).toBe(true)
      })
    })
  })

  describe('Size Tokens', () => {
    it('should have valid size values', () => {
      expect(sizeTokens).toBeDefined()
      expect(typeof sizeTokens).toBe('object')

      Object.values(sizeTokens).forEach(size => {
        expect(typeof size).toBe('string')
        expect(size).toMatch(/^\d+(\.\d+)?(rem|px|%|vh|vw)$/)
      })
    })
  })

  describe('Token Consistency', () => {
    it('should have consistent naming conventions', () => {
      // Verificar que todos los tokens siguen la convención camelCase
      const checkNaming = (obj: Record<string, any>) => {
        Object.keys(obj).forEach(key => {
          expect(key).toMatch(/^[a-z][a-zA-Z0-9]*$/)
        })
      }

      checkNaming(typographyTokens.fontSize)
      checkNaming(typographyTokens.fontWeight)
      checkNaming(spacingTokens)
      checkNaming(borderTokens.radius)
      checkNaming(borderTokens.width)
      checkNaming(shadowTokens)
      checkNaming(sizeTokens)
    })

    it('should have no duplicate values', () => {
      // Verificar que no hay valores duplicados en cada token
      const checkDuplicates = (obj: Record<string, any>) => {
        const values = Object.values(obj)
        const uniqueValues = new Set(values)
        expect(values.length).toBe(uniqueValues.size)
      }

      checkDuplicates(typographyTokens.fontSize)
      checkDuplicates(typographyTokens.fontWeight)
      checkDuplicates(spacingTokens)
    })

    it('should have logical value progression', () => {
      // Verificar que los valores siguen una progresión lógica
      const fontSizeValues = Object.values(typographyTokens.fontSize).map(s =>
        parseFloat(s),
      )
      const spacingValues = Object.values(spacingTokens).map(s => parseFloat(s))

      // Los tamaños de fuente deberían ser crecientes
      for (let i = 1; i < fontSizeValues.length; i++) {
        expect(fontSizeValues[i]).toBeGreaterThan(fontSizeValues[i - 1])
      }

      // Los espaciados deberían ser crecientes
      for (let i = 1; i < spacingValues.length; i++) {
        expect(spacingValues[i]).toBeGreaterThan(spacingValues[i - 1])
      }
    })
  })

  describe('Token Integration', () => {
    it('should have compatible typography and color tokens', () => {
      // Verificar que los tokens de tipografía y color son compatibles
      expect(typographyTokens.component.button).toBeDefined()
      expect(colorTokens.primary).toBeDefined()
      expect(semanticColors.primary).toBeDefined()
    })

    it('should have consistent component structure', () => {
      const componentTypography = typographyTokens.component

      // Verificar que todos los componentes tienen la misma estructura
      Object.values(componentTypography).forEach(component => {
        Object.values(component).forEach(size => {
          expect(size).toHaveProperty('fontSize')
          expect(size).toHaveProperty('fontWeight')
          expect(size).toHaveProperty('lineHeight')
          expect(size).toHaveProperty('letterSpacing')
        })
      })
    })
  })
})
