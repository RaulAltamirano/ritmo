import { vi, beforeEach, afterAll } from 'vitest'

// Mock Prisma client globally to avoid real DB connections in unit tests
vi.mock('~/server/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    userPreferences: {
      create: vi.fn(),
      update: vi.fn(),
    },
    taskSession: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn(prismaMock)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
  PrismaService: {
    getInstance: vi.fn(),
    initialize: vi.fn(),
    disconnect: vi.fn(),
    healthCheck: vi.fn().mockResolvedValue(true),
  },
}))

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})

// Expose the mock for direct access in tests
export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  userPreferences: {
    create: vi.fn(),
    update: vi.fn(),
  },
  taskSession: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
}
