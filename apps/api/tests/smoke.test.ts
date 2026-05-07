import { describe, expect, it } from 'vitest'

import { createAuthedUser } from './helpers/auth.ts'

describe('API smoke', () => {
  it('GET /api/users/me returns the authenticated user', async () => {
    const { user, request } = await createAuthedUser()

    const res = await request.get('/api/users/me')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user.email).toBe(user.email)
  })
})
