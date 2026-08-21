import type { ProgramTemplateSeed } from './programTemplates.seed.types.js'
import { day } from './programTemplates.seed.types.js'

export const ADVANCED_PROGRAM_TEMPLATE_SEEDS: ProgramTemplateSeed[] = [
  {
    code: 'advanced_1_1',
    level: 'advanced',
    daysPerWeek: 4,
    sourceFile: 'training/02C_rutinas_avanzadas.md',
    days: [
      day(1, 'Piernas A', 'lower', [
        ['a', 'knee-extension', '15,8,8,8,8rp'],
        ['b', 'deadlift', '10,6,6,6,6rp'],
        ['a', 'unilateral-squat', '10,8,8,8rp'],
        ['b', 'hip-thrust', '10,10,10,10rp'],
        ['a', 'goblet-squat', '10x4rp'],
        ['b', 'standing-knee-flexion', '12x4rp'],
      ]),
      day(2, 'Empuje / Tracción A', 'upper', [
        ['a', 'face-pull', '15,8,8,8,8rp'],
        ['b', 'bench-press', '10,6,6,6,6rp'],
        ['a', 'row-neutro', '10,8,8,8rp'],
        ['b', 'pec-fly', '10,10,10,10rp'],
        ['a', 'pull-down-prono', '10x4rp'],
        ['b', 'lateral-raises', '12x4rp'],
        ['c', 'machine-curl', '10,15,20rp (Drop set)'],
      ]),
      day(3, 'Piernas B', 'lower', [
        ['a', 'knee-extension', '20,15,10,15,20rp'],
        ['b', 'seated-knee-flexion', '10x4rp'],
        ['c', 'squat', '12x4rp'],
        ['a', 'hip-thrust', '12x4rp'],
        ['b', 'abductor', '15x3rp'],
        ['c', 'adductor', '20,15,10,15,20rp'],
        ['a', 'calf-raise', '15x3rp'],
      ]),
      day(4, 'Empuje / Tracción B', 'upper', [
        ['a', 'face-pull', '15,8,8,8,8rp'],
        ['b', 'lateral-raises', '10,6,6,6,6rp'],
        ['c', 'shoulder-press', '10,8,8,8rp'],
        ['a', 'pull-down-unilateral', '10/10x4rp'],
        ['b', 'pec-fly', '12x4rp'],
        ['c', 'preacher-curl', '12x4rp'],
        ['a', 'push-ups', '10,15,20rp (Drop set)'],
      ]),
    ],
  },
]
