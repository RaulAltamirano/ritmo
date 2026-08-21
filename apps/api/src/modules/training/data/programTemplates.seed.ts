import type { DayFocus, TrainingLevel } from '@prisma/client'

export interface TemplateSlotSeed {
  sortOrder: number
  block: 'a' | 'b' | 'c'
  exerciseSlug: string
  setsReps: string
  targetRir: string
  targetRpe: string
  emphasis?: 'main' | 'accessory'
}

interface TemplateDaySeed {
  dayNumber: number
  name: string
  focus: DayFocus
  slots: TemplateSlotSeed[]
}

export interface ProgramTemplateSeed {
  code: string
  level: TrainingLevel
  daysPerWeek: number
  sourceFile: string
  days: TemplateDaySeed[]
}

type SlotTuple = [
  block: TemplateSlotSeed['block'],
  exerciseSlug: string,
  setsReps: string,
]

const slots = (items: SlotTuple[]): TemplateSlotSeed[] =>
  items.map(([block, exerciseSlug, setsReps], index) => ({
    sortOrder: index + 1,
    block,
    exerciseSlug,
    setsReps,
    targetRir: '2',
    targetRpe: '8',
  }))

const day = (
  dayNumber: number,
  name: string,
  focus: DayFocus,
  items: SlotTuple[],
): TemplateDaySeed => ({ dayNumber, name, focus, slots: slots(items) })

export const PROGRAM_TEMPLATE_SEEDS: ProgramTemplateSeed[] = [
  {
    code: 'basic_1_0',
    level: 'basic',
    daysPerWeek: 4,
    sourceFile: 'training/02A_rutinas_basicas.md',
    days: [
      day(1, 'Empuje / Tracción A', 'upper', [
        ['a', 'shoulder-press', '10x4rp'],
        ['b', 'pull-down-neutro', '12x4rp'],
        ['a', 'incline-chest-press', '10x4rp'],
        ['b', 'row-neutro', '12x4rp'],
        ['a', 'rear-delt-machine', '12x4rp'],
        ['b', 'lateral-raises', '12x4rp'],
        ['c', 'machine-curl', '12x4rp'],
      ]),
      day(2, 'Piernas A', 'lower', [
        ['a', 'squat', '20,15,10,10,10rp (Serie rampa)'],
        ['b', 'calf-raise', '15x5rp'],
        ['a', 'unilateral-squat', '10/10x4rp'],
        ['b', 'knee-flexion', '12x4rp'],
        ['a', 'knee-extension', '10x4rp'],
        ['b', 'glute-kickback', '15x4rp'],
        ['c', 'adductor', '20x4rp'],
      ]),
      day(3, 'Empuje / Tracción B', 'upper', [
        ['a', 'chest-press', '10x4rp'],
        ['b', 'face-pull', '12x4rp'],
        ['a', 'pull-down-prono', '10x4rp'],
        ['b', 'lateral-raises', '12x4rp'],
        ['a', 'pec-fly', '12x4rp'],
        ['b', 'preacher-curl', '12x4rp'],
        ['c', 'cable-elbow-extension', '12x4rp'],
      ]),
      day(4, 'Piernas B', 'lower', [
        ['a', 'deadlift', '20,15,10,10,10rp (Serie rampa)'],
        ['b', 'calf-raise', '15x5rp'],
        ['a', 'hip-thrust', '10x4rp'],
        ['b', 'knee-flexion', '12x4rp'],
        ['a', 'goblet-squat', '10x4rp'],
        ['b', 'knee-extension', '15x4rp'],
        ['c', 'abductor', '20x4rp'],
      ]),
    ],
  },
  {
    code: 'basic_2_0',
    level: 'basic',
    daysPerWeek: 5,
    sourceFile: 'training/02A_rutinas_basicas.md',
    days: [
      day(1, 'Empuje', 'upper', [
        ['a', 'chest-press', '10x4rp'],
        ['b', 'lateral-raises', '12x4rp'],
        ['a', 'incline-chest-press', '10x4rp'],
        ['b', 'pec-fly', '12x4rp'],
        ['a', 'cable-elbow-extension', '12x4rp'],
        ['b', 'skull-crusher', '15x4rp'],
      ]),
      day(2, 'Tracción', 'upper', [
        ['a', 'row-prono', '10x4rp'],
        ['b', 'preacher-curl', '12x4rp'],
        ['a', 'pull-down-neutro', '10x4rp'],
        ['b', 'bayesian-curl', '12x4rp'],
        ['a', 'pull-over', '12x4rp'],
        ['b', 'face-pull', '12x4rp'],
        ['a', 'back-extension', '15x4rp'],
        ['b', 'abdomen', '15x4rp'],
      ]),
      day(3, 'Piernas A', 'lower', [
        ['a', 'squat', '20,15,10,10,10rp (Serie rampa)'],
        ['b', 'calf-raise', '15x5rp'],
        ['a', 'unilateral-squat', '10/10x4rp'],
        ['b', 'knee-flexion', '12x4rp'],
        ['a', 'knee-extension', '10x4rp'],
        ['b', 'glute-kickback', '15x4rp'],
        ['c', 'adductor', '20x4rp'],
      ]),
      day(4, 'Empuje / Tracción', 'upper', [
        ['a', 'shoulder-press', '10x4rp'],
        ['b', 'pull-down-prono', '12x4rp'],
        ['a', 'incline-chest-press', '10x4rp'],
        ['b', 'row-neutro', '12x4rp'],
        ['a', 'rear-delt-machine', '12x4rp'],
        ['b', 'lateral-raises', '12x4rp'],
        ['c', 'machine-curl', '12x4rp'],
      ]),
      day(5, 'Piernas B', 'lower', [
        ['a', 'deadlift', '20,15,10,10,10rp (Serie rampa)'],
        ['b', 'calf-raise', '15x5rp'],
        ['a', 'hip-thrust', '10x4rp'],
        ['b', 'knee-flexion', '12x4rp'],
        ['a', 'goblet-squat', '10x4rp'],
        ['b', 'knee-extension', '15x4rp'],
        ['c', 'abductor', '20x4rp'],
      ]),
    ],
  },
  {
    code: 'intermediate_1_0',
    level: 'intermediate',
    daysPerWeek: 3,
    sourceFile: 'training/02B_rutinas_intermedias.md',
    days: [
      day(1, 'Piernas', 'lower', [
        ['a', 'squat', '15,12,12,12,12rp (Serie rampa)'],
        ['b', 'adductor', '15x5rp'],
        ['a', 'unilateral-squat', '10x4rp'],
        ['b', 'knee-extension', '12x4rp'],
        ['a', 'leg-press', '10,15,20rp (Drop set)'],
        ['b', 'calf-raise', '15x3rp'],
      ]),
      day(2, 'Empuje', 'upper', [
        ['a', 'bench-press', '15,12,12,12,12rp (Serie rampa)'],
        ['b', 'lateral-raises', '15x5rp'],
        ['a', 'incline-chest-press', '10x4rp'],
        ['b', 'skull-crusher', '12x4rp'],
        ['a', 'pec-fly', '10,15,20rp (Drop set)'],
        ['b', 'cable-elbow-extension', '15x3rp'],
      ]),
      day(3, 'Tracción', 'upper', [
        ['a', 'deadlift', '15,12,12,12,12rp (Serie rampa)'],
        ['b', 'face-pull', '15x5rp'],
        ['a', 'pull-down-prono', '12x4rp'],
        ['b', 'elbow-flexion', '12x4rp'],
        ['a', 'row-neutro', '10,15,20rp (Drop set)'],
        ['b', 'knee-flexion', '15x3rp'],
        ['a', 'back-extension', '10x4rp'],
        ['b', 'abdominals', '10x4rp'],
      ]),
    ],
  },
  {
    code: 'intermediate_1_2',
    level: 'intermediate',
    daysPerWeek: 3,
    sourceFile: 'training/02B_rutinas_intermedias.md',
    days: [
      day(1, 'Empuje / Tracción A', 'upper', [
        ['a', 'face-pull', '12x4rp'],
        ['b', 'incline-chest-press', '10,8,8,8rp'],
        ['a', 'shoulder-press', '10x4rp'],
        ['b', 'lateral-raises', '12x4rp'],
        ['a', 'pull-down-unilateral', '10/10x4rp'],
        ['b', 'pec-fly', '12x4rp'],
        ['c', 'elbow-flexion', '15x4rp'],
      ]),
      day(2, 'Pierna', 'lower', [
        ['a', 'unilateral-squat', '10/10x4rp'],
        ['b', 'knee-extension', '15x4rp'],
        ['a', 'deadlift', '10x4rp'],
        ['b', 'knee-flexion', '15x4rp'],
        ['a', 'leg-press', '20,15,10,10,10rp (Drop set)'],
        ['b', 'adductor', '15x3rp'],
        ['c', 'abductor', '15x3rp'],
      ]),
      day(3, 'Empuje / Tracción B', 'upper', [
        ['a', 'pec-fly', '12x4rp'],
        ['b', 'row-neutro', '10,8,8,8rp'],
        ['a', 'pull-down-prono', '10x4rp'],
        ['b', 'lateral-raises', '12x4rp'],
        ['a', 'push-ups', '10x4rp'],
        ['b', 'face-pull', '12x4rp'],
        ['c', 'cable-elbow-extension', '15x4rp'],
      ]),
    ],
  },
  {
    code: 'intermediate_2_0',
    level: 'intermediate',
    daysPerWeek: 4,
    sourceFile: 'training/02B_rutinas_intermedias.md',
    days: [
      day(1, 'Piernas A', 'lower', [
        ['a', 'seated-knee-flexion', '20,12,12,12rp'],
        ['b', 'squat', '10,8,8,8,8rp'],
        ['a', 'unilateral-squat', '10x4rp'],
        ['b', 'hip-thrust', '12x4rp'],
        ['a', 'knee-extension', '10x4rp'],
        ['b', 'adductor', '15x4rp'],
        ['c', 'calf-raise', '20x4rp'],
      ]),
      day(2, 'Empuje / Tracción A', 'upper', [
        ['a', 'face-pull', '20,12,12,12rp'],
        ['b', 'chest-press', '10,8,8,8rp'],
        ['a', 'row-neutro', '10x4rp'],
        ['b', 'incline-chest-press', '12x4rp'],
        ['a', 'pull-down-unilateral', '10x4rp'],
        ['b', 'lateral-raises', '12x4rp'],
        ['a', 'elbow-flexion', '12x4rp'],
        ['b', 'cable-elbow-extension', '15x4rp'],
      ]),
      day(3, 'Piernas B', 'lower', [
        ['a', 'knee-extension', '20,12,12,12,12rp'],
        ['b', 'deadlift', '10,8,8,8,8rp'],
        ['a', 'leg-press', '10x4rp'],
        ['b', 'glute-kickback', '12x4rp'],
        ['a', 'standing-knee-flexion', '10x4rp'],
        ['b', 'abductor', '15x4rp'],
        ['c', 'calf-raise', '20x4rp'],
      ]),
      day(4, 'Empuje / Tracción B', 'upper', [
        ['a', 'pull-down-prono', '20,12,12,12rp'],
        ['b', 'shoulder-press', '10,8,8,8rp'],
        ['a', 'row-neutro', '10x4rp'],
        ['b', 'incline-chest-press', '12x4rp'],
        ['a', 'lateral-raises', '12x4rp'],
        ['b', 'pec-fly', '15x4rp'],
        ['a', 'elbow-flexion', '12x4rp'],
        ['b', 'skull-crusher', '15x4rp'],
      ]),
    ],
  },
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
