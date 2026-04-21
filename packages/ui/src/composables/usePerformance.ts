// Composable para optimización de performance - Ritmo UI 2025
// Memoización y optimizaciones para composables

import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

export interface PerformanceOptions {
  debounceMs?: number
  throttleMs?: number
  cacheSize?: number
  enableMemoization?: boolean
}

export interface CacheEntry<T> {
  key: string
  value: T
  timestamp: number
  accessCount: number
}

export function usePerformance(options: PerformanceOptions = {}) {
  const {
    debounceMs = 300,
    throttleMs = 100,
    cacheSize = 50,
    enableMemoization = true,
  } = options

  // Cache para memoización
  const cache = ref<Map<string, CacheEntry<any>>>(new Map())
  const performanceMetrics = ref({
    cacheHits: 0,
    cacheMisses: 0,
    renderTime: 0,
    memoryUsage: 0,
  })

  // Función para limpiar cache automáticamente
  const cleanupCache = () => {
    if (cache.value.size > cacheSize) {
      const entries = Array.from(cache.value.entries())
      entries.sort((a, b) => {
        // Priorizar por acceso reciente y frecuencia
        const scoreA = a[1].accessCount * (Date.now() - a[1].timestamp)
        const scoreB = b[1].accessCount * (Date.now() - b[1].timestamp)
        return scoreA - scoreB
      })

      // Eliminar el 20% más antiguo
      const toRemove = Math.ceil(cacheSize * 0.2)
      entries.slice(0, toRemove).forEach(([key]) => {
        cache.value.delete(key)
      })
    }
  }

  // Función para obtener valor del cache
  const getCachedValue = <T>(key: string): T | null => {
    const entry = cache.value.get(key)
    if (entry) {
      entry.accessCount++
      entry.timestamp = Date.now()
      performanceMetrics.value.cacheHits++
      return entry.value
    }
    performanceMetrics.value.cacheMisses++
    return null
  }

  // Función para almacenar valor en cache
  const setCachedValue = <T>(key: string, value: T): void => {
    cache.value.set(key, {
      key,
      value,
      timestamp: Date.now(),
      accessCount: 1,
    })
    cleanupCache()
  }

  // Función para memoización inteligente
  const memoize = <T>(key: string, computeFn: () => T, dependencies: any[] = []): T => {
    if (!enableMemoization) {
      return computeFn()
    }

    const cacheKey = `${key}_${JSON.stringify(dependencies)}`
    const cached = getCachedValue<T>(cacheKey)

    if (cached !== null) {
      return cached
    }

    const result = computeFn()
    setCachedValue(cacheKey, result)
    return result
  }

  // Función para debounce optimizado
  const createDebouncedFn = <T extends (...args: any[]) => any>(
    fn: T,
    ms: number = debounceMs,
  ) => {
    return useDebounceFn(fn, ms)
  }

  // Función para throttle optimizado
  const createThrottledFn = <T extends (...args: any[]) => any>(
    fn: T,
    ms: number = throttleMs,
  ) => {
    return useThrottleFn(fn, ms)
  }

  // Función para medir tiempo de renderizado
  const measureRenderTime = async (fn: () => void): Promise<number> => {
    const start = performance.now()
    await nextTick()
    fn()
    await nextTick()
    const end = performance.now()
    const renderTime = end - start
    performanceMetrics.value.renderTime = renderTime
    return renderTime
  }

  // Función para optimizar listas grandes
  const createVirtualizedList = <T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
  ) => {
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2
    const scrollTop = ref(0)

    const visibleItems = computed(() => {
      const startIndex = Math.floor(scrollTop.value / itemHeight)
      const endIndex = Math.min(startIndex + visibleCount, items.length)

      return items.slice(startIndex, endIndex).map((item, index) => ({
        item,
        index: startIndex + index,
        style: {
          position: 'absolute',
          top: `${(startIndex + index) * itemHeight}px`,
          height: `${itemHeight}px`,
        },
      }))
    })

    const totalHeight = computed(() => items.length * itemHeight)

    return {
      visibleItems,
      totalHeight,
      scrollTop,
      onScroll: (event: Event) => {
        const target = event.target as HTMLElement
        scrollTop.value = target.scrollTop
      },
    }
  }

  // Función para lazy loading de componentes
  const createLazyComponent = <T extends (...args: any[]) => any>(
    importFn: () => Promise<{ default: T }>,
    loadingComponent?: any,
    errorComponent?: any,
  ) => {
    const component = ref<T | null>(null)
    const loading = ref(true)
    const error = ref<Error | null>(null)

    const loadComponent = async () => {
      try {
        loading.value = true
        error.value = null
        const module = await importFn()
        component.value = module.default
      } catch (err) {
        error.value = err as Error
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadComponent()
    })

    return {
      component: computed(() => {
        if (error.value && errorComponent) {
          return errorComponent
        }
        if (loading.value && loadingComponent) {
          return loadingComponent
        }
        return component.value
      }),
      loading,
      error,
      reload: loadComponent,
    }
  }

  // Función para optimizar re-renders
  const createStableProps = <T extends Record<string, any>>(props: T) => {
    const stableProps = ref<T>(props)

    watch(
      () => props,
      newProps => {
        // Solo actualizar si realmente cambió
        const hasChanged = Object.keys(newProps).some(
          key => stableProps.value[key] !== newProps[key],
        )
        if (hasChanged) {
          stableProps.value = { ...newProps }
        }
      },
      { deep: true },
    )

    return stableProps
  }

  // Función para batch updates
  const createBatchUpdater = () => {
    const updates = ref<(() => void)[]>([])
    const isBatching = ref(false)

    const batchUpdate = (fn: () => void) => {
      if (isBatching.value) {
        updates.value.push(fn)
      } else {
        fn()
      }
    }

    const startBatch = () => {
      isBatching.value = true
    }

    const endBatch = async () => {
      isBatching.value = false
      const currentUpdates = [...updates.value]
      updates.value = []

      await nextTick()
      currentUpdates.forEach(update => update())
    }

    return {
      batchUpdate,
      startBatch,
      endBatch,
      isBatching,
    }
  }

  // Función para medir memoria
  const measureMemoryUsage = () => {
    if ('memory' in performance) {
      const {memory} = (performance as any)
      performanceMetrics.value.memoryUsage = memory.usedJSHeapSize
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      }
    }
    return null
  }

  // Limpiar cache al desmontar
  onUnmounted(() => {
    cache.value.clear()
  })

  return {
    // Cache y memoización
    memoize,
    getCachedValue,
    setCachedValue,
    cache,

    // Optimizaciones de funciones
    createDebouncedFn,
    createThrottledFn,

    // Medición de performance
    measureRenderTime,
    measureMemoryUsage,
    performanceMetrics,

    // Optimizaciones de UI
    createVirtualizedList,
    createLazyComponent,
    createStableProps,
    createBatchUpdater,

    // Utilidades
    cleanupCache,
  }
}

// Composable específico para optimización de tokens
export function useTokenPerformance() {
  const { memoize, createDebouncedFn } = usePerformance({
    debounceMs: 100,
    cacheSize: 100,
    enableMemoization: true,
  })

  // Memoización de tokens de tipografía
  const memoizedTypography = memoize(
    'typography-tokens',
    () => ({
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    }),
    [],
  )

  // Memoización de tokens de color
  const memoizedColors = memoize(
    'color-tokens',
    () => ({
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    }),
    [],
  )

  // Debounce para actualizaciones de tema
  const debouncedThemeUpdate = createDebouncedFn((theme: string) => {
    document.documentElement.setAttribute('data-theme', theme)
  }, 150)

  return {
    memoizedTypography,
    memoizedColors,
    debouncedThemeUpdate,
  }
}

// Composable para optimización de componentes
export function useComponentPerformance() {
  const { memoize, createStableProps, createBatchUpdater } = usePerformance()

  // Memoización de clases CSS
  const memoizedClasses = (
    baseClasses: string[],
    variantClasses: string[],
    sizeClasses: string[],
  ) => [...baseClasses, ...variantClasses, ...sizeClasses].join(' ')

  // Props estables para componentes
  const createStableComponentProps = <T extends Record<string, any>>(props: T) => {
    return createStableProps(props)
  }

  // Batch updater para múltiples componentes
  const createComponentBatchUpdater = () => {
    return createBatchUpdater()
  }

  return {
    memoizedClasses,
    createStableComponentProps,
    createComponentBatchUpdater,
  }
}
