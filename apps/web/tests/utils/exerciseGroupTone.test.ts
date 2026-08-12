import { describe, expect, it } from 'vitest'
import { getGroupToneClasses } from '@/utils/exerciseGroupTone'

describe('getGroupToneClasses', () => {
  it('maps each tone to design-system utility classes', () => {
    expect(getGroupToneClasses('brand').title).toContain('brand-text')
    expect(getGroupToneClasses('warning').rail).toContain('warning')
    expect(getGroupToneClasses('success').header).toContain('success')
    expect(getGroupToneClasses('neutral').article).toContain('outline')
  })
})
