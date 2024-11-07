import { Router } from 'express'
import { passbolt, portainer } from './controllers'

export const router = Router()

router.use('/passbolt', passbolt)
router.use('/portainer', portainer)
