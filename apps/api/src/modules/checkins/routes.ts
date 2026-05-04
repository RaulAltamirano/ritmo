import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { authenticateToken } from '../../core/middleware/auth.js'
import { DailyCheckinController } from './controllers/DailyCheckinController.js'

const router = Router()
const controller = new DailyCheckinController()

const runAuth = (req: Request, res: Response, next: NextFunction) => {
  void authenticateToken(req, res, next)
}

router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)

router.get('/daily/:calendarDate', runAuth, (req, res, next) => {
  void controller.getDaily(req, res, next)
})
router.put('/daily', runAuth, (req, res, next) => {
  void controller.putDaily(req, res, next)
})

export default router
