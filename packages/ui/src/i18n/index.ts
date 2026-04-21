// Configuración básica de i18n para Ritmo UI
// En un proyecto real, esto se integraría con vue-i18n o similar

import { translate } from './keys'

export const useI18n = () => {
  const t = (key: string, params?: Record<string, any>): string => {
    return translate(key, params)
  }

  return { t }
}

// Mock de vue-i18n para compatibilidad
export default {
  useI18n,
}

// Plugin para Storybook
export const i18nPlugin = {
  install: (app: any) => {
    app.config.globalProperties.$t = (key: string, params?: Record<string, any>) => {
      return translate(key, params)
    }

    app.provide('i18n', {
      t: (key: string, params?: Record<string, any>) => translate(key, params),
    })
  },
}
