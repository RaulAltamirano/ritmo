import { describe, expect, it } from 'vitest'
import type { ExerciseEntry } from '@/types/training'
import { groupExercisesByBlock } from '@/utils/groupExercisesByBlock'

function ex(id: string, block: ExerciseEntry['block']): ExerciseEntry {
  return {
    id,
    block,
    name: id,
    setsReps: '10x4',
    targetRir: '2',
    rpe: '8',
  }
}

describe('groupExercisesByBlock', () => {
  it('starts a new group when block a follows prior exercises', () => {
    const groups = groupExercisesByBlock([
      ex('1', 'a'),
      ex('2', 'b'),
      ex('3', 'a'),
      ex('4', 'b'),
    ])
    expect(groups).toHaveLength(2)
    expect(groups[0]?.map(e => e.id)).toEqual(['1', '2'])
    expect(groups[1]?.map(e => e.id)).toEqual(['3', '4'])
  })
})
