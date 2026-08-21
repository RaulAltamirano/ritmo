import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  useTrainingApi,
  type FrontendTrainingProfile,
  type TrainingChatMessage,
  type TrainingExercise,
  type TrainingProfilePatch,
} from '@/composables/useTrainingApi'
import type { ExerciseLog, TrainingSessionCheck, WeeklyPlan } from '@/types/training'
import { mapTrainingWeekToPlan } from '@/utils/mapTrainingWeekToPlan'

export const useTrainingStore = defineStore('training', () => {
  const api = useTrainingApi()
  const profile = ref<FrontendTrainingProfile | null>(null)
  const week = ref<WeeklyPlan | null>(null)
  const logs = ref<ExerciseLog[]>([])
  const sessionChecks = ref<TrainingSessionCheck[]>([])
  const exercises = ref<TrainingExercise[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let loadGeneration = 0

  const run = async <T>(operation: () => Promise<T>): Promise<T> => {
    loading.value = true
    error.value = null
    try {
      return await operation()
    } catch (cause) {
      const value = cause as { userMessage?: string; message?: string }
      error.value = value.userMessage ?? value.message ?? 'Training request failed'
      throw cause
    } finally {
      loading.value = false
    }
  }

  const loadProfile = () =>
    run(async () => {
      profile.value = await api.getProfile()
      return profile.value
    })

  const saveProfile = (patch: TrainingProfilePatch) =>
    run(async () => {
      profile.value = await api.updateProfile(patch)
      return profile.value
    })

  const sendChat = (messages: TrainingChatMessage[]) =>
    run(async () => {
      const result = await api.chat(messages)
      profile.value = result.profileDraft
      return result
    })

  const generateWeek = (weekStart: string) =>
    run(async () => {
      const generated = await api.generateWeek(weekStart)
      week.value = mapTrainingWeekToPlan(generated)
      return week.value
    })

  const generateWeekPreview = (weekStart: string) =>
    run(async () => mapTrainingWeekToPlan(await api.generateWeek(weekStart)))

  const applyWeek = (id: string) =>
    run(async () => {
      const result = await api.applyWeek(id)
      profile.value = result.profile
      week.value = mapTrainingWeekToPlan(result.week)
      return week.value
    })

  const clearWeekData = () => {
    loadGeneration += 1
    week.value = null
    logs.value = []
    sessionChecks.value = []
  }

  const loadWeek = (weekStart: string) => {
    const generation = loadGeneration
    return run(async () => {
      const loaded = await api.getWeek(weekStart)
      if (generation !== loadGeneration) return week.value
      week.value = loaded ? mapTrainingWeekToPlan(loaded) : null
      return week.value
    })
  }

  const loadExercises = () =>
    run(async () => {
      exercises.value = await api.getExercises()
      return exercises.value
    })

  const loadLogs = (from: string, to: string) => {
    const generation = loadGeneration
    return run(async () => {
      const loaded = await api.getLogs(from, to)
      if (generation !== loadGeneration) return logs.value
      logs.value = loaded
      return logs.value
    })
  }

  const saveLogs = (values: ExerciseLog[]) =>
    run(async () => {
      const saved = await Promise.all(values.map(value => api.saveLog(value)))
      const savedKeys = new Set(
        saved.map(value => `${value.dayKey}:${value.exerciseId}`),
      )
      logs.value = [
        ...logs.value.filter(
          value => !savedKeys.has(`${value.dayKey}:${value.exerciseId}`),
        ),
        ...saved,
      ]
      return saved
    })

  const loadSessionChecks = (dayKeys: string[]) => {
    const generation = loadGeneration
    return run(async () => {
      const loaded = await api.getSessionChecks(dayKeys)
      if (generation !== loadGeneration) return sessionChecks.value
      sessionChecks.value = loaded
      return sessionChecks.value
    })
  }

  const saveSessionCheck = (value: TrainingSessionCheck) =>
    run(async () => {
      const saved = await api.saveSessionCheck(value)
      sessionChecks.value = [
        ...sessionChecks.value.filter(check => check.dayKey !== saved.dayKey),
        saved,
      ]
      return saved
    })

  const reset = () => {
    loadGeneration += 1
    profile.value = null
    week.value = null
    logs.value = []
    sessionChecks.value = []
    exercises.value = []
    loading.value = false
    error.value = null
  }

  return {
    profile,
    week,
    logs,
    sessionChecks,
    exercises,
    loading,
    error,
    loadProfile,
    saveProfile,
    sendChat,
    generateWeek,
    generateWeekPreview,
    applyWeek,
    loadWeek,
    clearWeekData,
    loadExercises,
    loadLogs,
    saveLogs,
    loadSessionChecks,
    saveSessionCheck,
    reset,
  }
})
