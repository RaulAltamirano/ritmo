import type { User } from '@prisma/client'
import request from 'supertest'
import type { Response } from 'supertest'

import { generateAccessToken } from '../../src/core/utils/jwtUtils.ts'
import { userFactory } from '../factories/user.factory.ts'
import { userSessionFactory } from '../factories/user-session.factory.ts'
import { app, authedHttp, type AuthedHttp } from './http.ts'

export interface AuthedUser {
  user: User
  accessToken: string
  /** HTTP helpers with cookie auth applied */
  request: AuthedHttp
}

/** Create DB user + active session + JWT (skips HTTP login). */
export async function createAuthedUser(overrides?: Partial<User>): Promise<AuthedUser> {
  const user = await userFactory.create(overrides)
  const session = await userSessionFactory.create({
    userId: user.id,
  })
  const accessToken = generateAccessToken(user.id, session.sessionId)
  const expressApp = await app()
  return {
    user,
    accessToken,
    request: authedHttp(expressApp, accessToken),
  }
}

/** Raw cookie string for manual supertest usage */
export function asCookieAuth(accessToken: string): string {
  return `access_token=${accessToken}`
}

/** Full HTTP register + login — use for auth-route tests only. */
export async function loginAs(credentials: {
  email: string
  password: string
}): Promise<{ response: Response; accessToken: string; request: AuthedHttp }> {
  const expressApp = await app()
  const response = await request(expressApp)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .set('User-Agent', 'RITMO-Test-Suite/1.0.0')
    .send(credentials)

  const body = response.body as {
    data?: { accessToken?: string }
    success?: boolean
  }
  const accessToken = body?.data?.accessToken ?? ''

  const req =
    accessToken === ''
      ? authedHttp(expressApp, '')
      : authedHttp(expressApp, accessToken)

  return { response, accessToken, request: req }
}
