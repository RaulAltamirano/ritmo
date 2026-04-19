import type { AuthUser } from '~/types/auth'

export function createMockUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-uuid-1234',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
    timezone: 'UTC',
    emailVerified: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    preferences: {
      theme: 'light',
      language: 'en',
      notificationsEnabled: true,
      defaultTimeTechnique: 'pomodoro',
    },
    ...overrides,
  }
}

export function createMockDbUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-uuid-1234',
    email: 'test@example.com',
    password: '$2b$12$hashedpassword',
    name: 'Test User',
    avatar: null,
    timezone: 'UTC',
    emailVerified: true,
    isDeleted: false,
    deletedAt: null,
    lastActiveAt: null,
    totalTasksCount: 0,
    completedTasksCount: 0,
    currentStreakDays: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: null,
    updatedBy: null,
    preferences: {
      theme: 'light',
      language: 'en',
      notificationsEnabled: true,
      defaultTimeTechnique: 'pomodoro',
    },
    ...overrides,
  }
}

export function createMockSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'session-uuid-1234',
    taskId: 'task-uuid-1234',
    userId: 'user-uuid-1234',
    startTime: new Date(),
    endTime: null,
    plannedMinutes: 25,
    notes: null,
    interruptionLevel: 'none',
    productivityScore: null,
    mood: null,
    energy: null,
    isBreak: false,
    breakType: null,
    durationMinutes: null,
    partitionKey: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: null,
    updatedBy: null,
    ...overrides,
  }
}
