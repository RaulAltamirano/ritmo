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

const postWorkSessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const uid = (req as AuthenticatedRequest).user?.id
    if (uid) return uid
    return ipKeyGenerator(req.ip ?? '127.0.0.1')
  },
  handler: (req, res) => {
    ApiResponses.rateLimitExceeded('Too many work sessions started')
      .withRequestId(req.requestId ?? 'unknown')
      .send(res, 429)
  },
})

const patchWorkSessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const uid = (req as AuthenticatedRequest).user?.id
    if (uid) return uid
    return ipKeyGenerator(req.ip ?? '127.0.0.1')
  },
  handler: (req, res) => {
    ApiResponses.rateLimitExceeded('Too many heartbeat requests')
      .withRequestId(req.requestId ?? 'unknown')
      .send(res, 429)
  },
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
