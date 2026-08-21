import type {
  EquipmentProfile,
  Exercise,
  TrainingGoal,
  TrainingLevel,
} from '@prisma/client'
import OpenAI from 'openai'
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions'

import { INTAKE_SYSTEM_PROMPT } from '../prompts/intakeSystem.js'

export interface ProfileFields {
  level: TrainingLevel
  daysPerWeek: number
  minutesPerSession: number
  equipment: EquipmentProfile
  goal: TrainingGoal
  hasActiveInjury: boolean
  injuriesNotes: string | null
  restrictions: string | null
  understandsRir: boolean
  recentTrainingHistory: string | null
}

export interface ChatMessage {
  role: string
  content: string
}

export interface ChatCompletionRequest {
  model: string
  response_format: { type: 'json_object' }
  messages: ChatMessage[]
}

export interface ChatCompletionResult {
  choices: Array<{ message: { content: string | null } }>
}

export type CreateChatCompletion = (
  request: ChatCompletionRequest,
) => Promise<ChatCompletionResult>

export interface IntakeInput {
  messages: ChatMessage[]
  missingSlots: string[]
  profilePartial: object
}

export interface IntakeResult {
  assistantMessage: string
  profilePatch: Partial<ProfileFields>
  readyToGenerate: boolean
  stop: boolean
}

export interface SubstitutionInput {
  exerciseIds: string[]
  catalog: Exercise[]
  equipment: EquipmentProfile
  restrictions?: string
}

export interface Substitution {
  fromExerciseId: string
  toExerciseId: string
  reason: string
}

export interface SubstitutionResult {
  substitutions: Substitution[]
  warning?: string
}

const MAX_CHAT_MESSAGES = 30

function defaultCompletion(): CreateChatCompletion {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  return async request =>
    client.chat.completions.create(request as ChatCompletionCreateParamsNonStreaming)
}

function parseContent<T>(result: ChatCompletionResult): T {
  const content = result.choices[0]?.message.content
  if (!content) {
    throw new Error('OpenAI returned an empty completion')
  }

  return JSON.parse(content) as T
}

function intakeSystemMessage(input: IntakeInput): ChatMessage {
  const context = JSON.stringify({
    missingSlots: input.missingSlots,
    profilePartial: input.profilePartial,
  })

  return {
    role: 'system',
    content: `${INTAKE_SYSTEM_PROMPT}\n\nContexto actual: ${context}`,
  }
}

function substitutionMessages(input: SubstitutionInput): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'Propón sustituciones solo dentro de la misma familia de ejercicio y responde exclusivamente con JSON válido con substitutions.',
    },
    {
      role: 'user',
      content: JSON.stringify(input),
    },
  ]
}

export class OpenAiTrainingClient {
  private readonly createChatCompletion: CreateChatCompletion
  private readonly model: string

  constructor(
    createChatCompletion: CreateChatCompletion = defaultCompletion(),
    model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  ) {
    this.createChatCompletion = createChatCompletion
    this.model = model
  }

  async chatIntake(input: IntakeInput): Promise<IntakeResult> {
    const result = await this.createChatCompletion({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [
        intakeSystemMessage(input),
        ...input.messages.slice(-MAX_CHAT_MESSAGES),
      ],
    })

    return parseContent<IntakeResult>(result)
  }

  async proposeSubstitutions(input: SubstitutionInput): Promise<SubstitutionResult> {
    try {
      const result = await this.createChatCompletion({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: substitutionMessages(input),
      })

      return parseContent<SubstitutionResult>(result)
    } catch {
      return { substitutions: [], warning: 'openai_unavailable' }
    }
  }
}
