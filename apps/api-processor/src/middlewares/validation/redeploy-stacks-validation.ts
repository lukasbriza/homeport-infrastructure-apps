import type { NextFunction, Request, Response } from 'express'
import { redeployStackSchema } from '../../schemas'

export const redeployStackValidation = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const isValid = await redeployStackSchema.isValid(request.body)

    if (!isValid) {
      throw new Error('Request body validation failed.')
    }

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
