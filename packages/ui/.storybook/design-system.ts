// Configuración del sistema de diseño para Storybook
import { initializeDesignSystem } from '../src/tokens'

// Inicializar el sistema de diseño
if (typeof window !== 'undefined') {
  initializeDesignSystem()
  console.log('🎨 Sistema de diseño inicializado en Storybook')
}

export default {}
