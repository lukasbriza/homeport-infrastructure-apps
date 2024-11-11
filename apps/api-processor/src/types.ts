import type { Request } from 'express'

export type AuthenticatedRequest<T = unknown> = Request<T, unknown, { cookie: string[] }>
export type FolderResponsePartial = { secrets: { data: string }[]; name: string }[]
export type PublicKeyResponse = { keydata: string }

export type AddStackBody = {
  endpointId: number
  name: string
  repositoryURL: string
  repositoryAuthentication: boolean
  repositoryUsername: string
  repositoryPassword: string
  repositoryReferenceName: string
  composeFile: string
  tlsskipVerify: boolean
  fromAppTemplate: boolean
  autoUpdate: {
    forcePullImage?: boolean
    forceUpdate?: boolean
    interval?: string
    jobID?: string
    webhook?: string
  } | null
  additionalFiles?: string[] | null
  env: { name: string; value: string }[] | null
}

export type RedeployStackBody = {
  stackId: number
  endpointId: number
  env: { name: string; value: string }[]
  repositoryAuthentication: boolean
  repositoryUsername: string
  repositoryPassword: string
  repositoryReferenceName: string
  prune: boolean
  pullImage: boolean
}
