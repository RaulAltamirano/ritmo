import { Router } from 'express'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { asyncHandler } from '../../core/middleware/errorHandler.js'
import { ActivityController } from './controllers/ActivityController.js'

const router = Router()
const activityController = new ActivityController()

router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)

router.get('/', asyncHandler(activityController.getActivities.bind(activityController)))
router.get(
  '/today',
  asyncHandler(activityController.getTodayActivities.bind(activityController)),
)
router.post(
  '/',
  asyncHandler(activityController.createActivity.bind(activityController)),
)
router.put(
  '/:id',
  asyncHandler(activityController.updateActivity.bind(activityController)),
)
router.delete(
  '/:id',
  asyncHandler(activityController.deleteActivity.bind(activityController)),
)

export default router
