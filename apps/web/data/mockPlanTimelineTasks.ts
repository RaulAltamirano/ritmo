import type { Task } from '~/types/task'

function atTime(day: Date, hours: number, minutes: number): Date {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hours,
    minutes,
    0,
    0,
  )
}

/** Demo scheduled + unscheduled tasks for plan detail timeline UI. */
export function buildMockPlanTimelineTasks(
  planId: string,
  day: Date = new Date(),
): Task[] {
  const base = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const now = Date.now()

  return [
    {
      id: `mock-plan-wake-${planId}`,
      name: 'Wake up',
      title: 'Wake up',
      createdAt: new Date(now - 86_400_000),
      projectId: planId,
      category: 'Personal',
      priority: 'baja',
      completed: true,
      startTime: atTime(base, 8, 0),
      duration: '15m',
      estimatedTime: '15',
      status: 'completado',
    },
    {
      id: `mock-plan-morning-${planId}`,
      name: 'Morning routine',
      title: 'Morning routine',
      createdAt: new Date(now - 86_400_000),
      projectId: planId,
      category: 'Personal',
      priority: 'media',
      completed: false,
      startTime: atTime(base, 8, 15),
      endTime: atTime(base, 8, 45),
      duration: '30m',
      estimatedTime: '30',
      status: 'pendiente',
    },
    {
      id: `mock-plan-focus-${planId}`,
      name: 'Deep work block',
      title: 'Deep work block',
      createdAt: new Date(now - 86_400_000),
      projectId: planId,
      category: 'Study',
      priority: 'alta',
      completed: false,
      startTime: atTime(base, 9, 0),
      duration: '90m',
      estimatedTime: '90',
      status: 'pendiente',
    },
    {
      id: `mock-plan-coffee-${planId}`,
      name: 'Coffee with George',
      title: 'Coffee with George',
      createdAt: new Date(now - 86_400_000),
      projectId: planId,
      category: 'Personal',
      priority: 'media',
      completed: false,
      startTime: atTime(base, 10, 30),
      endTime: atTime(base, 11, 15),
      duration: '45m',
      estimatedTime: '45',
      status: 'pendiente',
    },
    {
      id: `mock-plan-review-${planId}`,
      name: 'Review flashcards',
      title: 'Review flashcards',
      createdAt: new Date(now - 86_400_000),
      projectId: planId,
      category: 'Study',
      priority: 'media',
      completed: false,
      startTime: atTime(base, 14, 0),
      duration: '25m',
      estimatedTime: '25',
      status: 'pendiente',
    },
    {
      id: `mock-plan-inbox-a-${planId}`,
      name: 'Call Mum',
      title: 'Call Mum',
      createdAt: new Date(now - 172_800_000),
      projectId: planId,
      category: 'Personal',
      priority: 'media',
      completed: false,
      status: 'pendiente',
    },
    {
      id: `mock-plan-inbox-b-${planId}`,
      name: 'Buy notebook',
      title: 'Buy notebook',
      createdAt: new Date(now - 259_200_000),
      projectId: planId,
      category: 'Personal',
      priority: 'baja',
      completed: false,
      status: 'pendiente',
    },
  ]
}
