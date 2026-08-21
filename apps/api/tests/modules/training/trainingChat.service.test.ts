import { BlockPhase, TrainingLevel } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import type { OpenAiTrainingClient } from '../../../src/modules/training/services/OpenAiTrainingClient.js'
import { TrainingProfileService } from '../../../src/modules/training/services/TrainingProfileService.js'

describe('TrainingProfileService.chat', () => {
  it('applies the model profile patch and derives generation readiness', async () => {
    const client = {
      chatIntake: vi.fn().mockResolvedValue({
        assistantMessage: 'Ahora dime cuántos días puedes entrenar.',
        profilePatch: { level: TrainingLevel.intermediate },
        readyToGenerate: true,
        stop: false,
      }),
    } as unknown as OpenAiTrainingClient
    const profile = {
      id: 'profile-id',
      userId: 'user-id',
      level: null,
      daysPerWeek: null,
      minutesPerSession: null,
      equipment: null,
      goal: null,
      hasActiveInjury: null,
      injuriesNotes: null,
      restrictions: null,
      understandsRir: false,
      programTemplateId: null,
      blockPhase: BlockPhase.accumulation,
      weekInBlock: 1,
      blockLengthWeeks: 4,
      historyWindowWeeks: 1,
    }
    const service = new TrainingProfileService(client)
    vi.spyOn(service, 'getProfile').mockResolvedValue(profile)
    vi.spyOn(service, 'upsertProfile').mockResolvedValue({
      ...profile,
      level: TrainingLevel.intermediate,
    })

    const result = await service.chat('user-id', [
      { role: 'user', content: 'Tengo experiencia intermedia.' },
    ])

    expect(client.chatIntake).toHaveBeenCalledWith({
      messages: [{ role: 'user', content: 'Tengo experiencia intermedia.' }],
      missingSlots: [
        'level',
        'daysPerWeek',
        'minutesPerSession',
        'equipment',
        'goal',
        'hasActiveInjury',
      ],
      profilePartial: profile,
    })
    expect(service.upsertProfile).toHaveBeenCalledWith('user-id', {
      level: TrainingLevel.intermediate,
    })
    expect(result.profileDraft?.level).toBe(TrainingLevel.intermediate)
    expect(result.readyToGenerate).toBe(false)
    expect(result.stop).toBe(false)
  })
})
