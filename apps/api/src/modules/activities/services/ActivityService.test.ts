import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActivityService } from './ActivityService.js'

const prismaMock = vi.hoisted(() => ({
  activity: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
  category: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('../../../../core/database/prisma.js', () => ({
  default: prismaMock,
}))

describe('ActivityService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns today activities mapped to frontend task shape', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'user_1' })
    prismaMock.activity.findMany.mockResolvedValue([
      {
        id: 'act_1',
        title: 'Write docs',
        description: 'Daily review',
        type: 'work',
        startTime: new Date('2026-04-19T10:00:00.000Z'),
        endTime: null,
        duration: 30,
        estimatedDuration: null,
        priority: 'high',
        status: 'active',
        tags: ['quick-task'],
        createdAt: new Date('2026-04-19T09:00:00.000Z'),
        updatedAt: new Date('2026-04-19T10:00:00.000Z'),
      },
    ])

    const service = new ActivityService()
    const result = await service.getTodayActivities()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'act_1',
      title: 'Write docs',
      type: 'work',
      priority: 'high',
      duration: 30,
      isCompleted: false,
      tags: ['quick-task'],
    })
  })

  it('creates activity with normalized enums and category fallback', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: 'user_1' })
    prismaMock.category.findFirst.mockResolvedValue(null)
    prismaMock.category.create.mockResolvedValue({ id: 'cat_1', name: 'WORK' })
    prismaMock.activity.create.mockResolvedValue({
      id: 'act_2',
      title: 'Quick task',
      description: null,
      type: 'work',
      startTime: new Date('2026-04-19T11:00:00.000Z'),
      endTime: null,
      duration: null,
      estimatedDuration: null,
      priority: 'medium',
      status: 'active',
      tags: ['quick-task'],
      createdAt: new Date('2026-04-19T11:00:00.000Z'),
      updatedAt: new Date('2026-04-19T11:00:00.000Z'),
    })

    const service = new ActivityService()
    const result = await service.createActivity({
      title: 'Quick task',
      startTime: new Date('2026-04-19T11:00:00.000Z'),
      priority: 'MEDIUM',
      category: 'WORK',
      tags: ['quick-task'],
    })

    expect(prismaMock.activity.create).toHaveBeenCalledTimes(1)
    expect(prismaMock.activity.create.mock.calls[0][0].data).toMatchObject({
      userId: 'user_1',
      title: 'Quick task',
      type: 'work',
      priority: 'medium',
      categoryId: 'cat_1',
    })
    expect(result).toMatchObject({
      id: 'act_2',
      title: 'Quick task',
      priority: 'medium',
      duration: 25,
    })
  })
})
