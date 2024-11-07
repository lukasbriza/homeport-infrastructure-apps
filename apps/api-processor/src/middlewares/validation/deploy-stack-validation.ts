import type { NextFunction, Request, Response } from 'express'
import { deployStackSchema } from '../../schemas'

export const deployStackValidation = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const isValid = await deployStackSchema.isValid(request.body)

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
