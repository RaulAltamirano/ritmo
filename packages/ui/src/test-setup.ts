import { vi } from 'vitest'

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn(() => ({
    getPropertyValue: vi.fn(() => 'rgb(0, 0, 0)'),
  })),
})

// Mock document methods
Object.defineProperty(document, 'getElementById', {
  value: vi.fn(() => null),
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}
