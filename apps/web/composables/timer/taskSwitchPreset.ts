export type TimerPresetRef = {
  minutes: number
  presetKey?: string
}

export function areSameTimerPreset(a: TimerPresetRef, b: TimerPresetRef): boolean {
  if (a.presetKey && b.presetKey) return a.presetKey === b.presetKey
  return a.minutes > 0 && b.minutes > 0 && a.minutes === b.minutes
}

export function canContinueRemainingOnSwitch(
  remainingSec: number,
  modeBMinutes: number,
): boolean {
  return Math.floor(remainingSec) <= modeBMinutes * 60
}
