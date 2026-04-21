/**
 * ⚡ PERFORMANCE MONITOR - 2025 BEST PRACTICES
 *
 * Performance monitoring utilities for measuring operation duration
 * Memory usage tracking and performance metrics
 */

import { RitmoLogger } from './ritmo-logger.js'

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

export const createPerformanceMonitor = (logger: RitmoLogger) => {
  return (operation: string) => {
    const startTime = process.hrtime.bigint()
    const startMemory = process.memoryUsage()

    return {
      end: (metadata?: Record<string, any>) => {
        const endTime = process.hrtime.bigint()
        const endMemory = process.memoryUsage()
        const duration = Number(endTime - startTime) / 1000000 // Convert to milliseconds

        const memoryDiff = {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
        }

        logger.performance({
          operation,
          duration,
          memory: memoryDiff,
          metadata,
        })
      },
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default createPerformanceMonitor
