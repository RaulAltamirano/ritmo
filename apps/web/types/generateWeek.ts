export type AiChatRole = 'assistant' | 'user' | 'system'

export interface AiChatMessage {
  id: string
  role: AiChatRole
  content: string
  createdAt: string
}

export interface AiModelOption {
  id: string
  name: string
  tag: string
}

export interface WeekDraftSession {
  dayOffset: 0 | 1 | 2 | 3 | 4 | 5 | 6
  title: string
  durationMin: number
  notes?: string
}

export interface WeekDraft {
  weekStart: string
  sessions: WeekDraftSession[]
  summary: string
}

export interface GenerateWeekIntakeSlots {
  level?: string
  friction?: string
  avoid?: string
  constraints?: string
  focusThisWeek?: string
}

export const STUB_AI_MODELS: AiModelOption[] = [
  { id: 'ritmo-fast', name: 'Ritmo Fast', tag: 'Fast' },
  { id: 'ritmo-balanced', name: 'Ritmo Balanced', tag: 'Medium' },
  { id: 'ritmo-deep', name: 'Ritmo Deep', tag: 'High' },
  { id: 'ritmo-coach', name: 'Ritmo Coach', tag: 'High' },
]

export const DEFAULT_STUB_MODEL_ID = 'ritmo-balanced'
