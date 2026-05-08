import { ref, type Ref } from 'vue'

interface RunOptions {
  /** `null` = error silenciado (p. ej. `CHECKIN_REQUIRED` tras flujo de gate). */
  mapError: (e: unknown) => string | null
}

/**
 * `busy` / `error` / `run` reutilizable para acciones async en modales.
 */
export function useAsyncAction() {
  const busy = ref(false)
  const error: Ref<string | null> = ref(null)

  async function run<T>(fn: () => Promise<T>, options: RunOptions): Promise<T | void> {
    busy.value = true
    error.value = null
    try {
      return await fn()
    } catch (e) {
      const msg = options.mapError(e)
      if (msg !== null) error.value = msg
      return undefined
    } finally {
      busy.value = false
    }
  }

  return { busy, error, run }
}
