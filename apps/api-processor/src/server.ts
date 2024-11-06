import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import type { Request, Response } from 'express'
import express from 'express'
import { router } from './router'

dotenv.config()
const app = express()
const PORT = process.env.API_PORT ?? 3001

// ROUTES
app.use(cookieParser())
app.use('/api', router)

app.use('/health', (_: Request, response: Response) => {
  response.status(200).send('Alive')
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port: ${PORT}`)
})
