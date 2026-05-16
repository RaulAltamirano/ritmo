/**
 * When the floating timer should show the work-block feedback flow.
 * Aligned with `useTimerStore.hydrateFromActiveRemoteSession` heuristics.
 */
export function needsWorkSessionFeedback(args: {
  state: 'running' | 'paused' | 'pending_feedback'
  timeLeftSec: number
}): boolean {
  return (
    args.state === 'pending_feedback' ||
    (args.state === 'running' && args.timeLeftSec <= 0)
  )
}
