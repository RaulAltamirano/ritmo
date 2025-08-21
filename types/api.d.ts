export interface ApiResponse<T> {
  data: T | null
  error: Error | null
  pending: boolean
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'

export interface ApiOptions {
  method?: HttpMethod
  headers?: HeadersInit
  body?: any
}
