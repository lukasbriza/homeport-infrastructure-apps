import type { Request } from 'express'

export type AuthenticatedRequest<T = unknown> = Request<T, unknown, { cookie: string[] }>
export type FolderResponsePartial = { secrets: { data: string }[]; name: string }[]
export type PublicKeyResponse = { keydata: string }
