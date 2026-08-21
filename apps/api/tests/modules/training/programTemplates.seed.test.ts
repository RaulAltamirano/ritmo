import { describe, expect, it } from 'vitest'
import { PROGRAM_TEMPLATE_SEEDS } from '../../../src/modules/training/data/programTemplates.seed.js'

describe('PROGRAM_TEMPLATE_SEEDS', () => {
  it('contains every program selected by the default motor matrix', () => {
    const codes = PROGRAM_TEMPLATE_SEEDS.map(template => template.code)

    expect(codes).toEqual(
      expect.arrayContaining([
        'basic_1_0',
        'basic_2_0',
        'intermediate_1_0',
        'intermediate_1_2',
        'intermediate_2_0',
        'advanced_1_1',
      ]),
    )
  })
})
