import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'

import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { authenticateToken } from '../../core/middleware/auth.js'
import { TrainingController } from './controllers/TrainingController.js'

const router = Router()
const controller = new TrainingController()

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
router.post('/chat', (req, res, next) => {
  void controller.chat(req, res, next)
})

export default router
