import { describe, expect, it } from 'vitest'
import { borderTokens, shadowTokens } from '../src/tokens/borders'
import { cssColorVariables, semanticColors } from '../src/tokens/colors'
import { componentSizes } from '../src/tokens/sizes'
import { spacingTokens } from '../src/tokens/spacing'
import { typographyTokens } from '../src/tokens/typography'

/** Recorre un objeto anidado y devuelve todas las hojas de tipo string. */
function collectStringLeaves(value: unknown): string[] {
  const out: string[] = []
  const walk = (v: unknown) => {
    if (typeof v === 'string') {
      out.push(v)
    } else if (v && typeof v === 'object') {
      Object.values(v as Record<string, unknown>).forEach(walk)
    }
  }
  walk(value)
  return out
}

describe('Design system tokens', () => {
  describe('Typography', () => {
    it('font sizes are rem strings', () => {
      Object.values(typographyTokens.fontSize).forEach(size => {
        expect(size).toMatch(/^\d+(\.\d+)?rem$/)
      })
    })

    it('font weights are numeric strings', () => {
      Object.values(typographyTokens.fontWeight).forEach(w => {
        expect(w).toMatch(/^\d{3}$/)
      })
    })

    it('component typography has expected shape', () => {
      expect(typographyTokens.component.button.md).toMatchObject({
        fontSize: expect.any(String),
        fontWeight: expect.any(String),
        lineHeight: expect.any(String),
        letterSpacing: expect.any(String),
      })
    })
  })

  describe('Semantic colors (Tailwind utilities)', () => {
    it('primary scale entries are class strings', () => {
      expect(semanticColors.primary['500']).toMatch(/\bbg-/)
      expect(semanticColors.primary['500']).toMatch(/\btext-/)
    })

    it('warning mid-tones use dark ink for contrast', () => {
      expect(semanticColors.warning['400']).toMatch(/text-yellow-9/)
    })
  })

  describe('CSS color variables', () => {
    it('values are hex or rgba', () => {
      Object.values(cssColorVariables).forEach(v => {
        const hex = /^#[0-9a-f]{3,8}$/i.test(v)
        const rgb = /^rgba?\([^)]+\)$/i.test(v)
        expect(hex || rgb).toBe(true)
      })
    })
  })

  describe('Spacing', () => {
    it('base scale uses rem', () => {
      const baseKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const
      baseKeys.forEach(k => {
        expect(spacingTokens[k]).toMatch(/rem$/)
      })
    })
  })

  describe('Borders & shadows', () => {
    it('border radius tokens are rem, px, 0, or full pill', () => {
      Object.values(borderTokens.borderRadius).forEach(r => {
        expect(r).toMatch(/^(0|9999px|\d+(\.\d+)?(rem|px))$/)
      })
    })

    it('shadow leaves are none or shadow CSS', () => {
      const leaves = collectStringLeaves(shadowTokens)
      expect(leaves.length).toBeGreaterThan(0)
      leaves.forEach(shadow => {
        const ok =
          shadow === 'none' ||
          shadow.includes('rgba') ||
          shadow.includes('rgb(') ||
          shadow.includes('inset')
        expect(ok).toBe(true)
      })
    })
  })

  describe('Component sizes', () => {
    it('button sizes map to utility strings or numbers', () => {
      const md = componentSizes.button.md
      expect(md.width).toMatch(/^w-/)
      expect(md.height).toMatch(/^h-/)
      expect(typeof md.text).toBe('string')
    })

    it('icon xs has numeric pixel size', () => {
      expect(componentSizes.icon.xs.size).toBe(12)
    })
  })
})
