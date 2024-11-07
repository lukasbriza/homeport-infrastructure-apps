import type { Response } from 'express'

export const processRequestFailed = (error: unknown, response: Response) => {
  // eslint-disable-next-line no-console
  console.error(error)
  if (error instanceof Error) {
    response.status(400).json({ message: error.message }).send()
    return
  }
  response
    .status(400)
    .json({ message: `Unknown error: ${String(error)}` })
    .send()
}
