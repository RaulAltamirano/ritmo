import { z } from 'zod'

/** Forma persistida en `UserPreferences.timerPresets` (spec §5.4). */
export const timerPresetsSchema = z.object({
  defaultPresetKey: z.string().min(1).max(32).optional(),
  presets: z
    .array(
      z.object({
        key: z.string().min(1).max(64),
        workSec: z.number().int().min(60).max(14400),
        breakSec: z.number().int().min(0).max(3600),
        label: z.string().max(120).optional(),
      }),
    )
    .min(1)
    .max(20),
})

export type TimerPresetsDTO = z.infer<typeof timerPresetsSchema>

export const DEFAULT_TIMER_PRESETS: TimerPresetsDTO = {
  defaultPresetKey: '25_5',
  presets: [
    { key: '25_5', workSec: 1500, breakSec: 300, label: 'Pomodoro clásico' },
    { key: '52_17', workSec: 3120, breakSec: 1020, label: 'Bloque medio' },
    { key: '90_20', workSec: 5400, breakSec: 1200, label: 'Bloque largo' },
  ],
}
