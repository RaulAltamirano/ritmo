import type { NuxtConfig } from '@nuxt/schema'

interface I18nConfig {
  locales: Array<{
    code: string
    name: string
  }>
  defaultLocale: string
  vueI18n: {
    fallbackLocale: string
    messages: {
      [key: string]: {
        [key: string]: string | string[]
      }
    }
  }
  strategy: 'no_prefix'
}

export type ExtendedNuxtConfig = NuxtConfig & {
  i18n: I18nConfig
}
