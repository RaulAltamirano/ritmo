import { ref, type Ref } from 'vue'
import type {
  AiChatMessage,
  GenerateWeekIntakeSlots,
  WeekDraft,
} from '@/types/generateWeek'
import { buildWeekDraft } from '@/utils/buildWeekDraft'

export type GenerateWeekChatPhase =
  | 'chatting'
  | 'readyToPreview'
  | 'generatingPreview'
  | 'preview'

const CORE_SLOTS = ['level', 'friction', 'avoid'] as const
type CoreSlot = (typeof CORE_SLOTS)[number]

const FORCE_READY = /^(generate|ready|listo)!?$/i

const PROMPTS: Record<CoreSlot, string> = {
  level: 'What is your current level or experience with this goal?',
  friction: 'What feels hardest right now?',
  avoid: 'What do you dislike or want to avoid in this week’s plan?',
}

export interface UseGenerateWeekChatOptions {
  planName: string
  weekStart: string
  minutesPerSession?: number
  daysPerWeek?: number
}

function newId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function assistantMessage(content: string): AiChatMessage {
  return {
    id: newId(),
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
  }
}

function nextEmptyCoreSlot(slots: GenerateWeekIntakeSlots): CoreSlot | null {
  for (const key of CORE_SLOTS) {
    if (!slots[key]?.trim()) return key
  }
  return null
}

function coreSlotsFilled(slots: GenerateWeekIntakeSlots): boolean {
  return CORE_SLOTS.every(key => Boolean(slots[key]?.trim()))
}

function splitAnswerParts(text: string): string[] {
  return text
    .split(/\n+|\s*;\s*/)
    .map(part => part.replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean)
}

function applyKeywordSlots(
  slots: GenerateWeekIntakeSlots,
  text: string,
): GenerateWeekIntakeSlots {
  const next = { ...slots }
  const level = text.match(
    /\b(?:level|nivel)\s*[:=]?\s*(beginner|intermediate|advanced|básico|basico|intermedio|avanzado)\b/i,
  )
  const friction = text.match(
    /\b(?:hardest|friction|cuesta|struggle[s]?)\s*[:=]?\s*([^.;]+)/i,
  )
  const avoid = text.match(
    /\b(?:avoid|dislike|evitar|no\s+me\s+gusta)\s*[:=]?\s*([^.;]+)/i,
  )
  if (!next.level?.trim() && level?.[1]) next.level = level[1].trim()
  if (!next.friction?.trim() && friction?.[1]) next.friction = friction[1].trim()
  if (!next.avoid?.trim() && avoid?.[1]) next.avoid = avoid[1].trim()
  return next
}

function applyAnswer(
  slots: GenerateWeekIntakeSlots,
  text: string,
): GenerateWeekIntakeSlots {
  const trimmed = text.trim()
  const parts = splitAnswerParts(trimmed)

  if (parts.length > 1) {
    const next = { ...slots }
    for (const part of parts) {
      const empty = nextEmptyCoreSlot(next)
      if (!empty) break
      next[empty] = part
    }
    return next
  }

  const withKeywords = applyKeywordSlots(slots, trimmed)
  if (
    withKeywords.level !== slots.level ||
    withKeywords.friction !== slots.friction ||
    withKeywords.avoid !== slots.avoid
  ) {
    return withKeywords
  }

  const next = { ...slots }
  const empty = nextEmptyCoreSlot(next)
  if (empty) next[empty] = trimmed
  return next
}

export function useGenerateWeekChat(
  options: UseGenerateWeekChatOptions | (() => UseGenerateWeekChatOptions),
): {
  messages: Ref<AiChatMessage[]>
  slots: Ref<GenerateWeekIntakeSlots>
  readyToPreview: Ref<boolean>
  draft: Ref<WeekDraft | null>
  phase: Ref<GenerateWeekChatPhase>
  error: Ref<string | null>
  sendUserMessage: (content: string) => void
  generatePreview: () => Promise<void>
  reset: () => void
} {
  const resolveOptions = (): UseGenerateWeekChatOptions =>
    typeof options === 'function' ? options() : options

  const messages = ref<AiChatMessage[]>([])
  const slots = ref<GenerateWeekIntakeSlots>({})
  const readyToPreview = ref(false)
  const draft = ref<WeekDraft | null>(null)
  const phase = ref<GenerateWeekChatPhase>('chatting')
  const error = ref<string | null>(null)
  let assistantQuestionTurns = 0

  function markReady(note?: string) {
    readyToPreview.value = true
    phase.value = 'readyToPreview'
    if (note) messages.value.push(assistantMessage(note))
  }

  function askNextOrReady(nextSlots: GenerateWeekIntakeSlots) {
    if (coreSlotsFilled(nextSlots) || assistantQuestionTurns >= 5) {
      markReady('Ready when you are — tap Generate preview.')
      return
    }
    const empty = nextEmptyCoreSlot(nextSlots)
    if (!empty) {
      markReady('Ready when you are — tap Generate preview.')
      return
    }
    assistantQuestionTurns += 1
    messages.value.push(assistantMessage(PROMPTS[empty]))
  }

  function reset() {
    messages.value = []
    slots.value = {}
    readyToPreview.value = false
    draft.value = null
    phase.value = 'chatting'
    error.value = null
    assistantQuestionTurns = 1
    messages.value.push(assistantMessage(PROMPTS.level))
  }

  function sendUserMessage(content: string) {
    const text = content.trim()
    if (!text) return

    messages.value.push({
      id: newId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    })

    if (FORCE_READY.test(text)) {
      markReady('Ready when you are — tap Generate preview.')
      return
    }

    slots.value = applyAnswer(slots.value, text)
    askNextOrReady(slots.value)
  }

  async function generatePreview() {
    if (!readyToPreview.value) return
    phase.value = 'generatingPreview'
    error.value = null
    try {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 150)
      })
      const opts = resolveOptions()
      draft.value = buildWeekDraft({
        planName: opts.planName,
        weekStart: opts.weekStart,
        slots: slots.value,
        minutesPerSession: opts.minutesPerSession,
        daysPerWeek: opts.daysPerWeek,
      })
      phase.value = 'preview'
    } catch {
      error.value = 'Could not generate a preview. Try again.'
      phase.value = 'readyToPreview'
    }
  }

  reset()

  return {
    messages,
    slots,
    readyToPreview,
    draft,
    phase,
    error,
    sendUserMessage,
    generatePreview,
    reset,
  }
}
