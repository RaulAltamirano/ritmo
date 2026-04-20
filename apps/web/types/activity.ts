export interface Activity {
  id: string
  title: string
  description?: string
  /** Constrained to API values e.g. 'TASK', 'EVENT', 'HABIT' */
  type: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isCompleted: boolean
  startTime: string
  /** Optional: the API may omit endTime for open-ended activities */
  endTime?: string
  /** Duration in minutes */
  duration: number
  category?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type ActivityPriority = Activity['priority']
export type ActivityPayloadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface CreateActivityPayload {
  title: string
  description?: string
  startTime: Date
  endTime?: Date
  priority: ActivityPayloadPriority
  category: string
  tags?: string[]
}

export interface UpdateActivityPayload {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  priority?: ActivityPayloadPriority
  category?: string
  isCompleted?: boolean
  tags?: string[]
}
