import { ExerciseFamily } from '@prisma/client'
import { EXERCISE_SEEDS_PART_2 } from './exercises.seed.part2.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ExerciseSeed = {
  slug: string
  name: string
  family: ExerciseFamily
  equipment: string[]
  isCore: boolean
}

export const EXERCISE_SEEDS: ExerciseSeed[] = [
  {
    slug: 'chest-press',
    name: 'Chest Press',
    family: ExerciseFamily.press_horizontal,
    equipment: ['machine'],
    isCore: true,
  },
  {
    slug: 'bench-press',
    name: 'Bench Press',
    family: ExerciseFamily.press_horizontal,
    equipment: ['barbell', 'dumbbells'],
    isCore: false,
  },
  {
    slug: 'flat-chest-press',
    name: 'Flat chest press',
    family: ExerciseFamily.press_horizontal,
    equipment: ['machine', 'dumbbells'],
    isCore: false,
  },
  {
    slug: 'push-ups',
    name: "Push Up's",
    family: ExerciseFamily.press_horizontal,
    equipment: ['bodyweight'],
    isCore: false,
  },
  {
    slug: 'dips',
    name: 'Dips',
    family: ExerciseFamily.press_horizontal,
    equipment: ['bodyweight'],
    isCore: false,
  },
  {
    slug: 'incline-chest-press',
    name: 'Incline Chest Press',
    family: ExerciseFamily.press_inclinado,
    equipment: ['machine', 'dumbbells'],
    isCore: true,
  },
  {
    slug: 'incline-bench-press',
    name: 'Incline Bench Press',
    family: ExerciseFamily.press_inclinado,
    equipment: ['barbell', 'dumbbells'],
    isCore: false,
  },
  {
    slug: 'pec-fly',
    name: 'Pec Fly',
    family: ExerciseFamily.aduccion_horizontal,
    equipment: ['machine', 'cable'],
    isCore: true,
  },
  {
    slug: 'pec-deck',
    name: 'Pec deck',
    family: ExerciseFamily.aduccion_horizontal,
    equipment: ['machine'],
    isCore: false,
  },
  {
    slug: 'cable-crossovers',
    name: 'Cruces en polea',
    family: ExerciseFamily.aduccion_horizontal,
    equipment: ['cable'],
    isCore: false,
  },
  {
    slug: 'shoulder-press',
    name: 'Shoulder Press',
    family: ExerciseFamily.press_vertical,
    equipment: ['machine', 'dumbbells', 'barbell'],
    isCore: true,
  },
  {
    slug: 'lateral-raises',
    name: 'Elevaciones laterales',
    family: ExerciseFamily.elevacion_lateral,
    equipment: ['dumbbells'],
    isCore: true,
  },
  {
    slug: 'cable-lateral',
    name: 'Cable lateral',
    family: ExerciseFamily.elevacion_lateral,
    equipment: ['cable'],
    isCore: false,
  },
  {
    slug: 'rear-delt',
    name: 'Rear Delt',
    family: ExerciseFamily.deltoides_posterior,
    equipment: ['machine'],
    isCore: true,
  },
  {
    slug: 'rear-delt-machine',
    name: 'Rear delt machine',
    family: ExerciseFamily.deltoides_posterior,
    equipment: ['machine'],
    isCore: true,
  },
  {
    slug: 'pull-down-prono',
    name: 'Pull Down (prono)',
    family: ExerciseFamily.jalon,
    equipment: ['cable'],
    isCore: true,
  },
  {
    slug: 'pull-down-neutro',
    name: 'Pull Down (neutro)',
    family: ExerciseFamily.jalon,
    equipment: ['cable'],
    isCore: false,
  },
  {
    slug: 'pull-down-unilateral',
    name: 'Pull Down (unilateral)',
    family: ExerciseFamily.jalon,
    equipment: ['cable'],
    isCore: false,
  },
  {
    slug: 'row-neutro',
    name: 'Row (neutro)',
    family: ExerciseFamily.remo,
    equipment: ['machine', 'cable'],
    isCore: true,
  },
  {
    slug: 'row-prono',
    name: 'Row (prono)',
    family: ExerciseFamily.remo,
    equipment: ['machine', 'cable'],
    isCore: false,
  },
  {
    slug: 'row-unilateral',
    name: 'Row (unilateral)',
    family: ExerciseFamily.remo,
    equipment: ['machine', 'cable', 'dumbbells'],
    isCore: false,
  },
  {
    slug: 'pull-over',
    name: 'Pull Over',
    family: ExerciseFamily.pullover,
    equipment: ['machine', 'dumbbells', 'cable'],
    isCore: true,
  },
  {
    slug: 'back-extension',
    name: 'Extensión de espalda',
    family: ExerciseFamily.extension_lumbar,
    equipment: ['machine', 'bench'],
    isCore: true,
  },
  {
    slug: 'roman-chair-hyperextension',
    name: 'Hiperextensión banco romano',
    family: ExerciseFamily.extension_lumbar,
    equipment: ['bench'],
    isCore: false,
  },
  {
    slug: 'squat',
    name: 'Squat',
    family: ExerciseFamily.sentadilla_bilateral,
    equipment: ['barbell'],
    isCore: true,
  },
  {
    slug: 'goblet-squat',
    name: 'Goblet squat',
    family: ExerciseFamily.sentadilla_bilateral,
    equipment: ['dumbbells'],
    isCore: false,
  },
  {
    slug: 'leg-press',
    name: 'Leg Press',
    family: ExerciseFamily.sentadilla_bilateral,
    equipment: ['machine'],
    isCore: false,
  },
  {
    slug: 'unilateral-squat',
    name: 'Unilateral Squat',
    family: ExerciseFamily.sentadilla_unilateral,
    equipment: ['dumbbells', 'smith_machine'],
    isCore: true,
  },
  {
    slug: 'bulgarian-split-squat',
    name: 'Bulgarian split squat',
    family: ExerciseFamily.sentadilla_unilateral,
    equipment: ['dumbbells', 'smith_machine'],
    isCore: false,
  },
  ...EXERCISE_SEEDS_PART_2,
]
