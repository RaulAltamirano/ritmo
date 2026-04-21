export interface IAppException {
  code: string
  message: string
  statusCode: number
  details?: unknown
  timestamp: Date
}
