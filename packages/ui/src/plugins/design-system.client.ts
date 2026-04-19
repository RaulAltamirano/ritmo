// Plugin para inicializar el sistema de diseño automáticamente
// Se ejecuta solo en el cliente para aplicar variables CSS

import { initializeDesignSystem, validateTokensApplied } from '../tokens'

export default () => {
  // Solo ejecutar en el cliente
  if (typeof window !== 'undefined') {
    // Inicializar sistema de diseño
    initializeDesignSystem()

    // Validar que los tokens se aplicaron correctamente
    const tokensApplied = validateTokensApplied()

    if (tokensApplied) {
      console.log('✅ Sistema de diseño inicializado correctamente')
    } else {
      console.warn('⚠️ Algunos tokens no se aplicaron correctamente')
    }

    // Configurar listener para cambios de tema del sistema
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', e => {
        console.log('🎨 Cambio de tema detectado:', e.matches ? 'dark' : 'light')
      })
    }
  }
}
