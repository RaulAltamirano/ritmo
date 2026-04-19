type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  data?: unknown
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const isDev = process.env.NODE_ENV !== 'production'
const minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? (isDev ? 'debug' : 'info')

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
}
const RESET = '\x1b[0m'

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[minLevel]
}

function formatDev(entry: LogEntry): string {
  const color = COLORS[entry.level]
  const prefix = `${color}[${entry.level.toUpperCase()}]${RESET}`
  const ctx = entry.context ? ` [${entry.context}]` : ''
  const data = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : ''
  return `${entry.timestamp} ${prefix}${ctx} ${entry.message}${data}`
}

function formatProd(entry: LogEntry): string {
  return JSON.stringify(entry)
}

function log(level: LogLevel, message: string, context?: string, data?: unknown): void {
  if (!shouldLog(level)) return

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && { context }),
    ...(data !== undefined && { data }),
  }

  const formatted = isDev ? formatDev(entry) : formatProd(entry)

  if (level === 'error') {
    console.error(formatted)
  } else if (level === 'warn') {
    console.warn(formatted)
  } else {
    console.log(formatted)
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: unknown) => log('debug', message, context, data),
  info: (message: string, context?: string, data?: unknown) => log('info', message, context, data),
  warn: (message: string, context?: string, data?: unknown) => log('warn', message, context, data),
  error: (message: string, context?: string, data?: unknown) => log('error', message, context, data),

  child: (context: string) => ({
    debug: (message: string, data?: unknown) => log('debug', message, context, data),
    info: (message: string, data?: unknown) => log('info', message, context, data),
    warn: (message: string, data?: unknown) => log('warn', message, context, data),
    error: (message: string, data?: unknown) => log('error', message, context, data),
  }),
}
