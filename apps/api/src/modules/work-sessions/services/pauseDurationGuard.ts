import { WorkSessionHttpError } from '../errors.js'

const CLOCK_SKEW_TOLERANCE_SEC = 2

export interface PauseDurationInput {
  incoming: number
  startTime: Date
  currentStored: number
  now: Date
}

/**
 * Valida un nuevo `pausedDurationSec`:
 *  - finito y no negativo
 *  - no inferior al valor ya persistido (monotónico)
 *  - no excede el wall-clock transcurrido desde `startTime` (+ tolerancia de skew)
 *
 * Lanza `WorkSessionHttpError(400, 'INVALID_PAUSED_DURATION')` en caso inválido.
 */
export function validatePausedDurationSec(input: PauseDurationInput): void {
  const { incoming, startTime, currentStored, now } = input

  if (!Number.isFinite(incoming)) {
    throw new WorkSessionHttpError(
      'pausedDurationSec must be finite',
      400,
      'INVALID_PAUSED_DURATION',
    )
  }
  if (incoming < 0) {
    throw new WorkSessionHttpError(
      'pausedDurationSec cannot be negative',
      400,
      'INVALID_PAUSED_DURATION',
    )
  }
  if (incoming < currentStored) {
    throw new WorkSessionHttpError(
      'pausedDurationSec cannot decrease (must be monotonic)',
      400,
      'INVALID_PAUSED_DURATION',
    )
  }
  const elapsedSec = Math.floor((now.getTime() - startTime.getTime()) / 1000)
  if (incoming > elapsedSec + CLOCK_SKEW_TOLERANCE_SEC) {
    throw new WorkSessionHttpError(
      'pausedDurationSec cannot exceed elapsed wall-clock since startTime',
      400,
      'INVALID_PAUSED_DURATION',
    )
  }
}
