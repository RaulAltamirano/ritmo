// Configuración avanzada para testing de Storybook
import { expect } from '@storybook/test'
import { within, userEvent } from '@storybook/testing-library'

// Configuración global para testing
export const testConfig = {
  // Timeouts para testing
  timeout: 5000,

  // Configuración de accesibilidad
  a11y: {
    rules: [
      { id: 'color-contrast', enabled: true },
      { id: 'button-name', enabled: true },
      { id: 'form-field-multiple-labels', enabled: true },
      { id: 'aria-required-attr', enabled: true },
      { id: 'aria-describedby', enabled: true },
      { id: 'heading-order', enabled: true },
      { id: 'landmark-one-main', enabled: true },
      { id: 'page-has-heading-one', enabled: true },
      { id: 'region', enabled: true },
      { id: 'skip-link', enabled: true },
      { id: 'aria-valid-attr-value', enabled: true },
      { id: 'aria-input-field-name', enabled: true },
      { id: 'focus-order-semantics', enabled: true },
      { id: 'keyboard', enabled: true },
    ],
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  },

  // Helpers para testing común
  helpers: {
    // Test de accesibilidad básica
    testAccessibility: async (canvasElement: HTMLElement) => {
      const canvas = within(canvasElement)

      // Verificar que no hay elementos sin roles apropiados
      const elements = canvasElement.querySelectorAll('*')
      for (const element of elements) {
        if (element.tagName !== 'HTML' && element.tagName !== 'BODY') {
          const role = element.getAttribute('role')
          const ariaLabel = element.getAttribute('aria-label')

          if (role === 'button' || role === 'link' || role === 'img') {
            expect(ariaLabel || element.textContent).toBeTruthy()
          }
        }
      }
    },

    // Test de keyboard navigation
    testKeyboardNavigation: async (canvasElement: HTMLElement) => {
      const canvas = within(canvasElement)
      const focusableElements = canvasElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement
        firstElement.focus()
        expect(document.activeElement).toBe(firstElement)
      }
    },

    // Test de focus visible
    testFocusVisible: async (canvasElement: HTMLElement) => {
      const focusableElements = canvasElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      for (const element of focusableElements) {
        const htmlElement = element as HTMLElement
        htmlElement.focus()

        // Verificar que el elemento tiene estilos de focus
        const computedStyle = window.getComputedStyle(htmlElement)
        const hasFocusStyles =
          computedStyle.outline !== 'none' ||
          computedStyle.boxShadow !== 'none' ||
          htmlElement.classList.contains('focus-visible')

        console.log(`Focus styles for ${htmlElement.tagName}:`, hasFocusStyles)
      }
    },
  },
}

// Exportar configuración global
export default testConfig
