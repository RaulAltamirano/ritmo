import { beforeEach } from 'vitest'

import { truncateAll } from '../helpers/db.ts'

beforeEach(async () => {
  await truncateAll()
})
