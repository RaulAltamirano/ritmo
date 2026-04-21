import { Router } from 'express'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { ActivityController } from './controllers/ActivityController.js'

const router = Router()
const activityController = new ActivityController()

router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)

router.get('/', activityController.getActivities.bind(activityController))
router.get('/today', activityController.getTodayActivities.bind(activityController))
router.post('/', activityController.createActivity.bind(activityController))
router.put('/:id', activityController.updateActivity.bind(activityController))
router.delete('/:id', activityController.deleteActivity.bind(activityController))

export default router
