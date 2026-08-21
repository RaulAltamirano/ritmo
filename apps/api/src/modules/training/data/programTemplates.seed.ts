import { ADVANCED_PROGRAM_TEMPLATE_SEEDS } from './programTemplates.seed.advanced.js'
import { BASIC_PROGRAM_TEMPLATE_SEEDS } from './programTemplates.seed.basic.js'
import { INTERMEDIATE_PROGRAM_TEMPLATE_SEEDS } from './programTemplates.seed.intermediate.js'
import type { ProgramTemplateSeed, TemplateSlotSeed } from './programTemplates.seed.types.js'

export type { ProgramTemplateSeed, TemplateSlotSeed }

export const PROGRAM_TEMPLATE_SEEDS: ProgramTemplateSeed[] = [
  ...BASIC_PROGRAM_TEMPLATE_SEEDS,
  ...INTERMEDIATE_PROGRAM_TEMPLATE_SEEDS,
  ...ADVANCED_PROGRAM_TEMPLATE_SEEDS,
]
