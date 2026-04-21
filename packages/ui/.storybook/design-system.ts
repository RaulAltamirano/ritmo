/**
 * Puente Storybook ↔ tokens del paquete `@ritmo/ui`.
 *
 * - Aplica variables CSS del sistema (`initializeDesignSystem`).
 * - Sincroniza `setColorTheme` con `@storybook/addon-themes`, que coloca las
 *   clases `light` | `dark` en `<html>` (evita desalinear tokens y Tailwind).
 * - No suscribe cambios del SO aquí: el toolbar de Storybook es la fuente de verdad.
 */
import { initializeDesignSystem, setColorTheme } from '../src/tokens'

const STORYBOOK_THEME_CLASSES = ['light', 'dark'] as const

function resolveThemeFromHtmlClassList(root: HTMLElement): 'light' | 'dark' | null {
  for (const name of STORYBOOK_THEME_CLASSES) {
    if (root.classList.contains(name)) {
      return name
    }
  }
  return null
}

function syncThemeFromStorybookHtml(): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const fromClasses = resolveThemeFromHtmlClassList(root)

  if (fromClasses) {
    setColorTheme(fromClasses)
    return
  }

  // Sin clase explícita (arranque): alinear con preferencia del usuario
  const prefersDark =
    typeof globalThis.matchMedia === 'function' &&
    globalThis.matchMedia('(prefers-color-scheme: dark)').matches === true
  setColorTheme(prefersDark ? 'dark' : 'light')
}

if (typeof globalThis.window !== 'undefined') {
  initializeDesignSystem({ subscribeToSystemThemeChanges: false })

  // Tras el primer layout, aplicar la clase que Storybook ya haya puesto en <html>
  requestAnimationFrame(() => {
    syncThemeFromStorybookHtml()
  })

  const observer = new MutationObserver(() => {
    syncThemeFromStorybookHtml()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      observer.disconnect()
    })
  }
}

export default {}
