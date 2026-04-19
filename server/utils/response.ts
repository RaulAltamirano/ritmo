export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  meta?: PaginationMeta
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, ...(message && { message }) }
}

export function paginated<T>(
  data: T,
  total: number,
  page: number,
  limit: number,
): ApiResponse<T> {
  const totalPages = Math.ceil(total / limit)
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

export function created<T>(data: T, message = 'Created successfully'): ApiResponse<T> {
  return { success: true, data, message }
}

export function noContent(): ApiResponse<null> {
  return { success: true, data: null }
}

export function parsePagination(query: Record<string, string | undefined>): {
  page: number
  limit: number
  skip: number
} {
  const page = Math.max(1, parseInt(query.page ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)))
  return { page, limit, skip: (page - 1) * limit }
}
