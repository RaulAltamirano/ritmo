import { logger } from '../utils/logger'

export default defineEventHandler((event) => {
  const start = Date.now()
  const { method, url } = event.node.req

  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    const status = event.node.res.statusCode

    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    logger[level](`${method} ${url} ${status} — ${duration}ms`, 'http')
  })
})
