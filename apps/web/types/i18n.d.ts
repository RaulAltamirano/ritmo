declare module '@nuxtjs/i18n' {
  interface I18nOptions {
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
}
