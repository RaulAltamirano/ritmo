import { randomUUID } from 'crypto'

import type { UserSession } from '@prisma/client'
import { DeviceType } from '@prisma/client'

import { workerPrisma } from '../setup/worker-context.ts'

export type UserSessionCreateInput = {
  userId: string
} & Partial<Pick<UserSession, 'sessionId' | 'deviceType' | 'expiresAt' | 'isActive'>>

export function buildUserSession(overrides: UserSessionCreateInput): {
  sessionId: string
  userId: string
  deviceType: DeviceType
  expiresAt: Date
  isActive: boolean
} {
  return {
    sessionId: overrides.sessionId ?? randomUUID(),
    userId: overrides.userId,
    deviceType: overrides.deviceType ?? DeviceType.desktop,
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: overrides.isActive ?? true,
  }
}

async function createSession(overrides: UserSessionCreateInput): Promise<UserSession> {
  const data = buildUserSession(overrides)
  return workerPrisma.userSession.create({
    data: {
      userId: data.userId,
      sessionId: data.sessionId,
      deviceType: data.deviceType,
      expiresAt: data.expiresAt,
      isActive: data.isActive,
    },
  })
}

export const userSessionFactory = {
  build: buildUserSession,
  create: createSession,
}
