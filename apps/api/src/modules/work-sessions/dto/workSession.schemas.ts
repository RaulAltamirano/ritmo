import {
  WorkSessionFrictionBlocker,
  WorkSessionState,
  WorkSessionTimeFit,
  WorkSessionTimerMode,
} from '@prisma/client'
import { z } from 'zod'

export const createWorkSessionBodySchema = z.object({
  taskId: z.string().min(1),
  targetDurationSec: z.number().int().positive(),
  timerMode: z.nativeEnum(WorkSessionTimerMode),
  breakDurationSec: z.number().int().min(0).max(3600).optional(),
  presetKey: z.string().max(64).optional(),
})

export const patchWorkSessionBodySchema = z
  .object({
    lastClientSeenAt: z.string().datetime().optional(),
    pausedDurationSec: z.number().int().min(0).optional(),
    breakPausedDurationSec: z.number().int().min(0).optional(),
    state: z.nativeEnum(WorkSessionState).optional(),
  })
  .strict()

export const completeWorkSessionBodySchema = z.object({
  rpeCognitive: z.number().int().min(1).max(5),
  frictionScore: z.number().int().min(1).max(5),
  frictionBlocker: z.nativeEnum(WorkSessionFrictionBlocker).optional(),
  energyAfter: z.number().int().min(1).max(5),
  /** Fuera del modal MVP; si se omiten, no se derivan focusScore/productivityScore. */
  perceivedFocus: z.number().int().min(1).max(5).optional(),
  perceivedProgress: z.number().int().min(1).max(5).optional(),
  timeFit: z.nativeEnum(WorkSessionTimeFit).optional(),
  notes: z.string().max(500).optional(),
})

export type CreateWorkSessionBody = z.infer<typeof createWorkSessionBodySchema>
export type PatchWorkSessionBody = z.infer<typeof patchWorkSessionBodySchema>
export type CompleteWorkSessionBody = z.infer<typeof completeWorkSessionBodySchema>
