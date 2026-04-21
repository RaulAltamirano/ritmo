// Composable para IDs únicos y determinísticos - Ritmo UI 2025
// Versión mejorada para evitar problemas de hidratación

import { readonly, ref } from 'vue'

// Contador por componente para evitar conflictos
const componentCounters = new Map<string, number>()

// Función para generar hash simple de props
function hashProps(props: Record<string, any>): string {
  const propsString = Object.entries(props)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}-${value}`)
    .join('-')

  if (!propsString) return 'default'

  let hash = 0
  for (let i = 0; i < propsString.length; i++) {
    const char = propsString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

export function useId(prefix: string = 'id', props?: Record<string, any>) {
  // Generar ID basado en props si están disponibles
  if (props) {
    const propsHash = hashProps(props)
    const componentId = ref(`${prefix}-${propsHash}`)
    return readonly(componentId)
  }

  // Usar contador por componente para IDs únicos
  const counter = componentCounters.get(prefix) || 0
  componentCounters.set(prefix, counter + 1)

  const componentId = ref(`${prefix}-${counter}`)
  return readonly(componentId)
}

// Función para generar ID único con prefijo personalizado
export function generateId(prefix: string = 'id', props?: Record<string, any>): string {
  if (props) {
    const propsHash = hashProps(props)
    return `${prefix}-${propsHash}`
  }

  const counter = componentCounters.get(prefix) || 0
  componentCounters.set(prefix, counter + 1)
  return `${prefix}-${counter}`
}

// Función para generar ID único con timestamp (para casos especiales)
export function generateTimestampId(prefix: string = 'id'): string {
  const counter = componentCounters.get(prefix) || 0
  componentCounters.set(prefix, counter + 1)
  return `${prefix}-${Date.now()}-${counter}`
}

// Función para generar ID basado en contenido (determinístico)
export function generateContentId(content: string, prefix: string = 'id'): string {
  const hash = content
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString(36)

  return `${prefix}-${hash}`
}

// Función para generar ID basado en props (determinístico)
export function generatePropsId(
  props: Record<string, any>,
  prefix: string = 'id',
): string {
  const propsString = Object.entries(props)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}-${value}`)
    .join('-')

  if (!propsString) {
    return generateId(prefix)
  }

  return generateContentId(propsString, prefix)
}

// Función para generar ID determinístico basado en el nombre del componente
export function useComponentId(
  componentName: string,
  props?: Record<string, any>,
): string {
  if (props) {
    return generatePropsId(props, componentName)
  }

  const counter = componentCounters.get(componentName) || 0
  componentCounters.set(componentName, counter + 1)

  return `${componentName}-${counter}`
}
