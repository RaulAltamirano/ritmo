import { EquipmentProfile, ExerciseFamily, type Exercise } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

import {
  OpenAiTrainingClient,
  type ChatCompletionRequest,
} from '../../../src/modules/training/services/OpenAiTrainingClient.js'

const completion = (value: object) => ({
  choices: [{ message: { content: JSON.stringify(value) } }],
})

describe('OpenAiTrainingClient', () => {
  it('returns structured intake JSON and caps chat history to the last 30 messages', async () => {
    const expected = {
      assistantMessage: '¿Cuántos días puedes entrenar?',
      profilePatch: { level: 'basic' },
      readyToGenerate: false,
      stop: false,
    }
    const createChatCompletion = vi
      .fn<(request: ChatCompletionRequest) => Promise<ReturnType<typeof completion>>>()
      .mockResolvedValue(completion(expected))
    const client = new OpenAiTrainingClient(createChatCompletion)
    const messages = Array.from({ length: 35 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: `message-${index}`,
    }))

    const result = await client.chatIntake({
      messages,
      missingSlots: ['daysPerWeek'],
      profilePartial: { level: 'basic' },
    })

    expect(result).toEqual(expected)
    const request = createChatCompletion.mock.calls[0][0]
    expect(request.model).toBe('gpt-4o-mini')
    expect(request.response_format).toEqual({ type: 'json_object' })
    expect(request.messages).toHaveLength(31)
    expect(request.messages[1]).toEqual({
      role: 'assistant',
      content: 'message-5',
    })
  })

  it('returns an availability warning when substitution completion fails', async () => {
    const createChatCompletion = vi.fn().mockRejectedValue(new Error('network error'))
    const client = new OpenAiTrainingClient(createChatCompletion)
    const catalog: Exercise[] = [
      {
        id: 'bench-press',
        slug: 'bench-press',
        name: 'Bench Press',
        family: ExerciseFamily.press_horizontal,
        equipment: ['barbell'],
        isCore: true,
      },
    ]

    const result = await client.proposeSubstitutions({
      exerciseIds: ['bench-press'],
      catalog,
      equipment: EquipmentProfile.home,
    })

    expect(result).toEqual({
      substitutions: [],
      warning: 'openai_unavailable',
    })
  })
})
