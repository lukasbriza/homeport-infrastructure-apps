import type { NextFunction, Request, Response } from 'express'
import { redeployStackSchema } from '../../schemas'

export const redeployStackValidation = async (request: Request, response: Response, next: NextFunction) => {
  try {
    await redeployStackSchema.validate(request.body)

    next()
  } catch (error) {
    if (error instanceof Error) {
      response.status(400).json({ message: error.message }).send()
      return
    }
    response
      .status(400)
      .json({ message: `Unknown error: ${String(error)}` })
      .send()
  }
}
