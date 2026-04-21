import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ritmoAppExtend = require('../../../packages/config/ritmo-app-theme.cjs')

describe('ritmo-app-theme (fuente única web + landing)', () => {
  it('expone escala primary teal producto Ritmo', () => {
    expect(ritmoAppExtend.colors.primary[500]).toBe('#14b8a6')
    expect(ritmoAppExtend.colors.primary[950]).toBe('#042f2e')
  })

  it('incluye semanticos y grises slate', () => {
    expect(ritmoAppExtend.colors.success[500]).toBe('#22c55e')
    expect(ritmoAppExtend.colors.gray[900]).toBe('#0f172a')
    expect(ritmoAppExtend.colors.accent[500]).toBe('#f97316')
  })

  it('define fuentes Plus Jakarta / JetBrains mono', () => {
    expect(ritmoAppExtend.fontFamily.sans[0]).toContain('Plus Jakarta')
    expect(ritmoAppExtend.fontFamily.mono[0]).toContain('JetBrains')
  })

  it('define animaciones app', () => {
    expect(ritmoAppExtend.animation['fade-in']).toContain('fadeIn')
    expect(ritmoAppExtend.keyframes.fadeIn['100%']).toEqual({ opacity: '1' })
  })
})
