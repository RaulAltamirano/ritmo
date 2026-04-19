/**
 * 🏗️ BASE INTERFACES - RITMO API 2025
 *
 * Interfaces base que definen contratos para toda la aplicación
 * Siguiendo principios de Clean Architecture y SOLID
 */

// ========================================
// BASE ENTITY INTERFACE
// ========================================

export interface IEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// ========================================
// BASE REPOSITORY INTERFACE
// ========================================

export interface IRepository<T extends IEntity> {
  findById(id: string): Promise<T | null>
  findAll(filters?: Record<string, any>): Promise<T[]>
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<boolean>
  exists(id: string): Promise<boolean>
}

// ========================================
// BASE SERVICE INTERFACE
// ========================================

export interface IService<T extends IEntity> {
  getById(id: string): Promise<T | null>
  getAll(filters?: Record<string, any>): Promise<T[]>
  create(data: any): Promise<T>
  update(id: string, data: any): Promise<T>
  delete(id: string): Promise<boolean>
}

// ========================================
// BASE CONTROLLER INTERFACE
// ========================================

export interface IController {
  // Métodos HTTP básicos
  get?(req: any, res: any, next?: any): Promise<void>
  post?(req: any, res: any, next?: any): Promise<void>
  put?(req: any, res: any, next?: any): Promise<void>
  delete?(req: any, res: any, next?: any): Promise<void>
  patch?(req: any, res: any, next?: any): Promise<void>
}

// ========================================
// BASE DTO INTERFACE
// ========================================

export interface IDTO {
  validate(): boolean
  toEntity(): any
  fromEntity(entity: any): this
}

// ========================================
// BASE VALIDATOR INTERFACE
// ========================================

export interface IValidator<T> {
  validate(data: any): { isValid: boolean; errors: string[] }
  sanitize(data: any): T
}

// ========================================
// BASE RESPONSE INTERFACE
// ========================================

export interface IApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any[]
  }
  meta?: {
    timestamp: string
    path: string
    method: string
    requestId?: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

// ========================================
// BASE EXCEPTION INTERFACE
// ========================================

export interface IAppException {
  code: string
  message: string
  statusCode: number
  details?: any
  timestamp: Date
}

// ========================================
// BASE LOGGER INTERFACE
// ========================================

export interface ILogger {
  info(message: string, meta?: any): void
  warn(message: string, meta?: any): void
  error(message: string, meta?: any): void
  debug(message: string, meta?: any): void
  trace(message: string, meta?: any): void
}

// ========================================
// BASE CACHE INTERFACE
// ========================================

export interface ICache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}

// ========================================
// BASE SECURITY INTERFACE
// ========================================

export interface ISecurityService {
  hashPassword(password: string): Promise<string>
  comparePassword(password: string, hash: string): Promise<boolean>
  generateToken(payload: any): string
  verifyToken(token: string): any
  generateSecureRandom(length?: number): string
}

// ========================================
// BASE CONFIG INTERFACE
// ========================================

export interface IConfig {
  get(key: string): any
  has(key: string): boolean
  all(): Record<string, any>
}

// ========================================
// BASE EVENT INTERFACE
// ========================================

export interface IEvent {
  id: string
  type: string
  data: any
  timestamp: Date
  source: string
}

export interface IEventHandler<T extends IEvent> {
  handle(event: T): Promise<void>
}

export interface IEventBus {
  publish(event: IEvent): Promise<void>
  subscribe(eventType: string, handler: IEventHandler<any>): void
  unsubscribe(eventType: string, handler: IEventHandler<any>): void
}

// ========================================
// BASE MIDDLEWARE INTERFACE
// ========================================

export interface IMiddleware {
  execute(req: any, res: any, next: any): Promise<void> | void
}

// ========================================
// BASE ROUTE INTERFACE
// ========================================

export interface IRoute {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  handler: IController
  middleware?: IMiddleware[]
  validation?: IValidator<any>
}

// ========================================
// BASE MODULE INTERFACE
// ========================================

export interface IModule {
  name: string
  routes: IRoute[]
  controllers: IController[]
  services: Array<IService<any>>
  repositories: Array<IRepository<any>>
  initialize(): Promise<void>
  destroy(): Promise<void>
}

// ========================================
// BASE FACTORY INTERFACE
// ========================================

export interface IFactory<T> {
  create(config?: any): T
}

// ========================================
// BASE ADAPTER INTERFACE
// ========================================

export interface IAdapter<T, U> {
  adapt(source: T): U
  adaptMany(sources: T[]): U[]
}

// ========================================
// BASE QUERY INTERFACE (CQRS)
// ========================================

export interface IQuery<T = any> {
  execute(): Promise<T>
}

export interface ICommand<T = any> {
  execute(): Promise<T>
}

export interface IQueryHandler<T extends IQuery> {
  handle(query: T): Promise<any>
}

export interface ICommandHandler<T extends ICommand> {
  handle(command: T): Promise<any>
}

// ========================================
// BASE METRICS INTERFACE
// ========================================

export interface IMetrics {
  increment(counter: string, labels?: Record<string, string>): void
  gauge(name: string, value: number, labels?: Record<string, string>): void
  histogram(name: string, value: number, labels?: Record<string, string>): void
  timer(name: string, labels?: Record<string, string>): () => void
}

// ========================================
// BASE HEALTH CHECK INTERFACE
// ========================================

export interface IHealthCheck {
  name: string
  check(): Promise<{ status: 'healthy' | 'unhealthy'; details?: any }>
}

export interface IHealthChecker {
  addCheck(check: IHealthCheck): void
  runChecks(): Promise<Record<string, any>>
}

// ========================================
// BASE RATE LIMITER INTERFACE
// ========================================

export interface IRateLimiter {
  isAllowed(key: string): Promise<boolean>
  increment(key: string): Promise<number>
  reset(key: string): Promise<void>
}

// ========================================
// BASE NOTIFICATION INTERFACE
// ========================================

export interface INotification {
  id: string
  type: string
  recipient: string
  subject: string
  content: string
  metadata?: Record<string, any>
  sentAt?: Date
}

export interface INotificationService {
  send(notification: INotification): Promise<boolean>
  sendBulk(notifications: INotification[]): Promise<boolean[]>
}

// ========================================
// BASE AUDIT INTERFACE
// ========================================

export interface IAuditLog {
  id: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

export interface IAuditService {
  log(auditLog: Omit<IAuditLog, 'id' | 'timestamp'>): Promise<void>
  getLogs(filters?: Record<string, any>): Promise<IAuditLog[]>
}
