/* eslint-disable no-console */
import type { Response } from 'express'

export const processRequestFailed = (error: unknown, response: Response) => {
  console.log(error)
  if (error instanceof Error) {
    console.error(error.message)
    console.error(error.cause)
    response.status(400).json({ message: error.message }).send()
    return
  }
  response
    .status(400)
    .json({ message: `Unknown error: ${String(error)}` })
    .send()
}
