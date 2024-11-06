/* eslint-disable no-loop-func */
import axios from 'axios'
import type { Response } from 'express'
import { Router } from 'express'
import { authenticate } from '../middlewares/passbolt'
import { passboltPaths } from '../paths'
import type { AuthenticatedRequest, FolderResponsePartial } from '../types'
import { decryptPassboltMessage, verifyEnvironment } from '../utils'

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

      if (folderResourceResponse.status !== 200) {
        // eslint-disable-next-line no-console
        console.error(folderResourceResponse.data)
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
  })
