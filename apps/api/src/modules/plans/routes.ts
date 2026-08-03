import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { authenticateToken } from '../../core/middleware/auth.js'
import { PlanController } from './controllers/PlanController.js'

const router = Router()
const controller = new PlanController()

router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)
router.use((req: Request, res: Response, next: NextFunction) => {
  void authenticateToken(req, res, next)
})

router.get('/', (req, res, next) => {
  void controller.getPlans(req, res, next)
})
router.post('/', (req, res, next) => {
  void controller.createPlan(req, res, next)
})
router.get('/:id/tasks', (req, res, next) => {
  void controller.getPlanTasks(req, res, next)
})
router.get('/:id', (req, res, next) => {
  void controller.getPlan(req, res, next)
})
router.patch('/:id', (req, res, next) => {
  void controller.updatePlan(req, res, next)
})
router.delete('/:id', (req, res, next) => {
  void controller.deletePlan(req, res, next)
})

export default router
