export interface Activity {
  id: string
  title: string
  description?: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isCompleted: boolean
  startTime: string
  endTime: string
  duration: number
  category?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type ActivityPriority = Activity['priority']

export interface CreateActivityPayload {
  title: string
  description?: string
  startTime: Date
  endTime?: Date
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  tags?: string[]
}

export interface UpdateActivityPayload {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category?: string
  isCompleted?: boolean
  tags?: string[]
}
