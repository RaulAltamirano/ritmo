import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { authenticateToken } from '../../core/middleware/auth.js'
import { TaskController } from './controllers/TaskController.js'

const router = Router()
const controller = new TaskController()

router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)
router.use((req: Request, res: Response, next: NextFunction) => {
  void authenticateToken(req, res, next)
})

router.get('/today', (req, res, next) => {
  void controller.getTodayTasks(req, res, next)
})
router.get('/', (req, res, next) => {
  void controller.getTasks(req, res, next)
})
router.post('/', (req, res, next) => {
  void controller.createTask(req, res, next)
})
router.put('/:id', (req, res, next) => {
  void controller.updateTask(req, res, next)
})
router.delete('/:id', (req, res, next) => {
  void controller.deleteTask(req, res, next)
})

export default router
