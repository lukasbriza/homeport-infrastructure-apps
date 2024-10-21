import { existsSync, mkdirSync } from 'node:fs'

export const createDirectory = (path: string) => {
  try {
    if (!existsSync(path)) {
      mkdirSync(path)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
