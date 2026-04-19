import type { ZodSchema, ZodError } from 'zod'
import { UnprocessableError, BadRequestError } from './errors'

export function parseBody<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new UnprocessableError('Validation failed', formatZodError(result.error))
  }
  return result.data
}

export function parseQuery<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new BadRequestError('Invalid query parameters', formatZodError(result.error))
  }
  return result.data
}

export function formatZodError(error: ZodError): Record<string, string[]> {
  return error.errors.reduce<Record<string, string[]>>((acc, issue) => {
    const path = issue.path.join('.') || 'root'
    if (!acc[path]) acc[path] = []
    acc[path].push(issue.message)
    return acc
  }, {})
}
