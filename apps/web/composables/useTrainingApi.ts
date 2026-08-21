import { useHttpClient } from '@/composables/shared/useHttpClient'
import type { ExerciseLog, TrainingSessionCheck } from '@/types/training'
import type { FrontendTrainingWeek } from '@/utils/mapTrainingWeekToPlan'

export type TrainingLevel = 'basic' | 'intermediate' | 'advanced'
export type EquipmentProfile =
  | 'full_gym'
  | 'limited_machines'
  | 'dumbbells_cables'
  | 'home'
export type TrainingGoal = 'hypertrophy' | 'strength' | 'recomposition' | 'health'

export interface FrontendTrainingProfile {
  id: string
  userId: string
  level: TrainingLevel | null
  daysPerWeek: number | null
  minutesPerSession: number | null
  equipment: EquipmentProfile | null
  goal: TrainingGoal | null
  hasActiveInjury: boolean | null
  injuriesNotes: string | null
  restrictions: string | null
  understandsRir: boolean
  programTemplateId: string | null
  blockPhase: 'accumulation' | 'deload'
  weekInBlock: number
  blockLengthWeeks: number
  historyWindowWeeks: number
}

export type TrainingProfilePatch = Partial<
  Pick<
    FrontendTrainingProfile,
    | 'level'
    | 'daysPerWeek'
    | 'minutesPerSession'
    | 'equipment'
    | 'goal'
    | 'hasActiveInjury'
    | 'injuriesNotes'
    | 'restrictions'
    | 'understandsRir'
  >
>

export interface TrainingChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TrainingChatResult {
  assistantMessage: string
  profileDraft: FrontendTrainingProfile | null
  readyToGenerate: boolean
  stop: boolean
}

export interface TrainingExercise {
  id: string
  slug: string
  name: string
  family: string
  equipment: string[]
  isCore: boolean
}

export interface ApplyTrainingWeekResult {
  week: FrontendTrainingWeek
  profile: FrontendTrainingProfile
}

export const useTrainingApi = () => {
  const http = useHttpClient()
  const path = '/training'

  const getProfile = async () =>
    (await http.get<FrontendTrainingProfile | null>(`${path}/profile`)).data
  const updateProfile = async (patch: TrainingProfilePatch) =>
    (await http.put<FrontendTrainingProfile>(`${path}/profile`, patch)).data
  const chat = async (messages: TrainingChatMessage[]) =>
    (await http.post<TrainingChatResult>(`${path}/chat`, { messages })).data
  const generateWeek = async (weekStart: string) =>
    (
      await http.post<FrontendTrainingWeek>(`${path}/weeks/generate`, {
        weekStart,
      })
    ).data
  const applyWeek = async (id: string) =>
    (await http.post<ApplyTrainingWeekResult>(`${path}/weeks/${id}/apply`, {})).data
  const getWeek = async (weekStart: string) =>
    (
      await http.get<FrontendTrainingWeek | null>(`${path}/weeks`, {
        params: { weekStart },
      })
    ).data
  const getExercises = async () =>
    (await http.get<TrainingExercise[]>(`${path}/exercises`)).data
  const getLogs = async (from: string, to: string) =>
    (
      await http.get<ExerciseLog[]>(`${path}/logs`, {
        params: { from, to },
      })
    ).data
  const saveLog = async (log: ExerciseLog) =>
    (await http.put<ExerciseLog>(`${path}/logs`, log)).data
  const getSessionChecks = async (dayKeys: string[]) =>
    (
      await http.get<TrainingSessionCheck[]>(`${path}/session-checks`, {
        params: { dayKeys: dayKeys.join(',') },
      })
    ).data
  const saveSessionCheck = async (check: TrainingSessionCheck) =>
    (await http.put<TrainingSessionCheck>(`${path}/session-checks`, check)).data

  return {
    getProfile,
    updateProfile,
    chat,
    generateWeek,
    applyWeek,
    getWeek,
    getExercises,
    getLogs,
    saveLog,
    getSessionChecks,
    saveSessionCheck,
  }
}
