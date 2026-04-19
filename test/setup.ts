import { cleanup } from '@testing-library/vue'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

// Setup global test environment
beforeAll(() => {
  // Global setup before all tests
  console.log('🧪 Setting up test environment...')
})

afterAll(() => {
  // Global cleanup after all tests
  console.log('🧹 Cleaning up test environment...')
})

beforeEach(() => {
  // Setup before each test
})

afterEach(() => {
  // Cleanup after each test
  cleanup()
})

// Mock global objects
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
