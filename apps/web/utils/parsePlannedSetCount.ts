const DEFAULT_SET_COUNT = 4

export function parsePlannedSetCount(setsReps: string): number {
  const ramp = setsReps.match(/\d+(?:\s*,\s*\d+)+/)
  if (ramp) {
    return ramp[0].split(',').map(s => s.trim()).filter(Boolean).length
  }
  const times = setsReps.match(/x\s*(\d+)/i)
  if (times?.[1]) {
    const n = Number.parseInt(times[1], 10)
    if (Number.isFinite(n) && n > 0) return n
  }
  return DEFAULT_SET_COUNT
}
