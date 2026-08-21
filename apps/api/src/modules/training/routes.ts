import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { authenticateToken } from '../../core/middleware/auth.js'
import { TrainingController } from './controllers/TrainingController.js'

const router = Router()
const controller = new TrainingController()
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req =>
    ((req as Request & { user?: { id?: string } }).user?.id ??
      ipKeyGenerator(req.ip ?? '')) as string,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many training AI requests, please try again later',
    },
  },
})

router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)
router.use((req: Request, res: Response, next: NextFunction) => {
  void authenticateToken(req, res, next)
})

router.get('/profile', (req, res, next) => {
  void controller.getProfile(req, res, next)
})
router.put('/profile', (req, res, next) => {
  void controller.updateProfile(req, res, next)
})
router.post('/chat', aiRateLimit, (req, res, next) => {
  void controller.chat(req, res, next)
})
router.post('/weeks/generate', aiRateLimit, (req, res, next) => {
  void controller.generateWeek(req, res, next)
})
router.post('/weeks/:id/apply', (req, res, next) => {
  void controller.applyWeek(req, res, next)
})
router.get('/weeks', (req, res, next) => {
  void controller.getWeek(req, res, next)
})
router.get('/exercises', (req, res, next) => {
  void controller.getExercises(req, res, next)
})
router.get('/logs', (req, res, next) => {
  void controller.getLogs(req, res, next)
})
router.put('/logs', (req, res, next) => {
  void controller.upsertLog(req, res, next)
})
router.get('/session-checks', (req, res, next) => {
  void controller.getSessionChecks(req, res, next)
})
router.put('/session-checks', (req, res, next) => {
  void controller.upsertSessionCheck(req, res, next)
})

export default router
