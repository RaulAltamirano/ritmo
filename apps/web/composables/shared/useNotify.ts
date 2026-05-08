/**
 * 🔔 RITMO NOTIFY COMPOSABLE
 *
 * Lightweight, app-wide notification + confirmation system.
 *
 * Replaces native `alert()` / `confirm()` with an accessible, themed UI that
 * is rendered globally by `components/organisms/AppNotifications.vue` (mounted
 * in `app.vue`). State is module-scoped so any component can trigger it.
 */
import { reactive, readonly } from 'vue'

export type NotifyType = 'success' | 'info' | 'warning' | 'error'

export interface NotifyMessage {
  id: number
  title: string
  message?: string
  type: NotifyType
}

export interface ConfirmRequest {
  id: number
  title: string
  message?: string
  confirmLabel: string
  cancelLabel: string
  resolve: (value: boolean) => void
}

interface NotifyState {
  messages: NotifyMessage[]
  confirm: ConfirmRequest | null
}

const state = reactive<NotifyState>({
  messages: [],
  confirm: null,
})

let counter = 0
const nextId = (): number => {
  counter += 1
  return counter
}

const AUTO_DISMISS_MS = 4000

export const useNotify = () => {
  const dismiss = (id: number): void => {
    const index = state.messages.findIndex(m => m.id === id)
    if (index !== -1) {
      state.messages.splice(index, 1)
    }
  }

  const notify = (
    title: string,
    options: { message?: string; type?: NotifyType } = {},
  ): number => {
    const id = nextId()
    state.messages.push({
      id,
      title,
      message: options.message,
      type: options.type ?? 'info',
    })

    if (typeof window !== 'undefined') {
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    }

    return id
  }

  const notifySuccess = (title: string, message?: string): number =>
    notify(title, { message, type: 'success' })

  const notifyError = (title: string, message?: string): number =>
    notify(title, { message, type: 'error' })

  const notifyWarning = (title: string, message?: string): number =>
    notify(title, { message, type: 'warning' })

  const notifyInfo = (title: string, message?: string): number =>
    notify(title, { message, type: 'info' })

  /**
   * Promise-based replacement for `window.confirm`. Resolves `true` when the
   * user confirms, `false` otherwise.
   */
  const confirm = (
    title: string,
    options: {
      message?: string
      confirmLabel?: string
      cancelLabel?: string
    } = {},
  ): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      // If a confirm is already open, resolve it as cancelled first.
      if (state.confirm) {
        state.confirm.resolve(false)
      }

      state.confirm = {
        id: nextId(),
        title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirmar',
        cancelLabel: options.cancelLabel ?? 'Cancelar',
        resolve,
      }
    })
  }

  const resolveConfirm = (value: boolean): void => {
    if (state.confirm) {
      state.confirm.resolve(value)
      state.confirm = null
    }
  }

  return {
    state: readonly(state),
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    dismiss,
    confirm,
    resolveConfirm,
  }
}
