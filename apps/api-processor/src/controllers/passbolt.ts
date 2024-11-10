/* eslint-disable no-console */
/* eslint-disable no-loop-func */
import axios from 'axios'
import type { Response } from 'express'
import { Router } from 'express'
import { authenticate } from '../middlewares/passbolt'
import { passboltPaths } from '../paths'
import type { AuthenticatedRequest, FolderResponsePartial } from '../types'
import { decryptPassboltMessage, processRequestFailed, verifyEnvironment } from '../utils'

export const passbolt = Router()

passbolt
  .route('/folder-secrets/:folderId')
  .get(authenticate, async (request: AuthenticatedRequest<{ folderId: string }>, response: Response) => {
    try {
      verifyEnvironment([process.env.PASSBOLT_API])
      const url = `${process.env.PASSBOLT_API}${passboltPaths.resources}?contain[secret]=1&filter[has-parent]=${request.params.folderId}`
      const folderResourceResponse = await axios.get<{ body: FolderResponsePartial }>(url, {
        headers: {
          Cookie: request.body.cookie.join(';'),
        },
        withCredentials: true,
      })
      console.group()
      console.log('folderResourceResponse:')
      console.log(folderResourceResponse)
      console.log('-------------------------------------------------------------------------------------')
      console.groupEnd()

      if (folderResourceResponse.status !== 200) {
        console.group()
        console.log('folderResourceResponse Error:')
        console.log('Status:', folderResourceResponse.status)
        console.log(folderResourceResponse)
        console.log('-------------------------------------------------------------------------------------')
        console.groupEnd()
        throw new Error('Retrieving folder resources was not successfull.')
      }

      const secretsRepsonseArray: FolderResponsePartial = folderResourceResponse.data.body
      let responseData: object = {}
      const promiseArray: Promise<void>[] = []

      for (const object of secretsRepsonseArray) {
        const secretPgpMessage = decodeURIComponent(object.secrets[0].data)
        promiseArray.push(
          decryptPassboltMessage(secretPgpMessage).then((secret) => {
            const parsed = JSON.parse(String(secret)) as { password: string; description: string }
            responseData = Object.assign(responseData, responseData, { [object.name]: parsed.password })
          }),
        )
      }

      await Promise.all(promiseArray)

      response.status(200).send(responseData)
    } catch (error) {
      processRequestFailed(error, response)
    }
  })
