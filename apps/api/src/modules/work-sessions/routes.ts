import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import {
  authenticateToken,
  type AuthenticatedRequest,
} from '../../core/middleware/auth.js'
import { ApiResponses } from '../../core/utils/apiResponse.js'
import { WorkSessionController } from './controllers/WorkSessionController.js'

const router = Router()
const controller = new WorkSessionController()

const POST_LIMIT = { windowMs: 60 * 60 * 1000, max: 60 } as const
const PATCH_LIMIT = { windowMs: 60 * 1000, max: 30 } as const

function requireAuthUser(req: Request, res: Response, next: NextFunction): void {
  const u = (req as AuthenticatedRequest).user
  if (!u?.id) {
    ApiResponses.unauthorized('Authentication required')
      .withRequestId(req.requestId ?? 'unknown')
      .send(res, 401)
    return
  }
  next()
}

function workSessionRateKey(req: Request): string {
  const uid = (req as AuthenticatedRequest).user?.id
  if (uid) return uid
  return ipKeyGenerator(req.ip ?? '127.0.0.1')
}

function rateLimitHandler(message: string) {
  return (req: Request, res: Response) => {
    ApiResponses.rateLimitExceeded(message)
      .withRequestId(req.requestId ?? 'unknown')
      .send(res, 429)
  }
}

const postWorkSessionLimiter = rateLimit({
  ...POST_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: workSessionRateKey,
  handler: rateLimitHandler('Too many work sessions started'),
})

const patchWorkSessionLimiter = rateLimit({
  ...PATCH_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: workSessionRateKey,
  handler: rateLimitHandler('Too many heartbeat requests'),
})

router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)
router.use((req: Request, res: Response, next: NextFunction) => {
  void authenticateToken(req, res, next)
})
router.use(requireAuthUser)

router.get('/active', (req, res, next) => {
  void controller.getActive(req, res, next)
})
router.get('/today-summary', (req, res, next) => {
  void controller.todaySummary(req, res, next)
})
router.get('/', (req, res, next) => {
  void controller.list(req, res, next)
})
router.post('/', postWorkSessionLimiter, (req, res, next) => {
  void controller.create(req, res, next)
})
router.patch('/:id', patchWorkSessionLimiter, (req, res, next) => {
  void controller.patch(req, res, next)
})
router.post('/:id/complete', (req, res, next) => {
  void controller.complete(req, res, next)
})
router.post('/:id/abandon', (req, res, next) => {
  void controller.abandon(req, res, next)
})

export default router
