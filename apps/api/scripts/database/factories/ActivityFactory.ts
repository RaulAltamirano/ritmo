import { PrismaClient } from '@prisma/client'
import { DEMO_ACTIVITIES } from '../config/database'

export class ActivityFactory {
  constructor(private readonly prisma: PrismaClient) {}

  async createDemoActivities(userId: string) {
    const activities = await Promise.all(
      DEMO_ACTIVITIES.map(activityData => {
        const startTime = new Date(
          Date.now() + activityData.hoursFromNow * 60 * 60 * 1000,
        )
        const endTime = new Date(
          startTime.getTime() + activityData.duration * 60 * 1000,
        )

        return this.prisma.task.create({
          data: {
            userId,
            title: activityData.title,
            description: activityData.description,
            type: activityData.type,
            status: 'todo',
            duration: activityData.duration,
            startTime,
            endTime,
            priority: activityData.priority,
            tags: activityData.tags,
          },
        })
      }),
    )

    return activities
  }

  async createActivity(
    userId: string,
    activityData: {
      title: string
      description: string
      type: 'work' | 'learning' | 'health' | 'creative' | 'personal'
      duration: number
      priority: 'low' | 'medium' | 'high'
      tags: string[]
      hoursFromNow?: number
    },
  ) {
    const hoursFromNow = activityData.hoursFromNow ?? 1
    const startTime = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
    const endTime = new Date(startTime.getTime() + activityData.duration * 60 * 1000)

    return this.prisma.task.create({
      data: {
        userId,
        title: activityData.title,
        description: activityData.description,
        type: activityData.type,
        status: 'todo',
        duration: activityData.duration,
        startTime,
        endTime,
        priority: activityData.priority,
        tags: activityData.tags,
      },
    })
  }
}
