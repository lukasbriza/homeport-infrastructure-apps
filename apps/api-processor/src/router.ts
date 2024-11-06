import { Router } from 'express'
import { passbolt } from './controllers'

export const router = Router()

router.use('/passbolt', passbolt)
