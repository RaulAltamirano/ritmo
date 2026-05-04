export class WorkSessionHttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly payload?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'WorkSessionHttpError'
  }
}
