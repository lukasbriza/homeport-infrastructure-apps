import { Router, Request, Response } from "express"
import axios from "axios"
import { authenticate } from "../middlewares/passbolt"
import { decryptPassboltMessage, verifyEnv } from "../utils"
import { passboltPaths } from "../paths"

export const passbolt = Router()

passbolt
  .route("/folder-secrets/:folderId")
  .get(authenticate, async (req: Request, res: Response) => {
    try {
      verifyEnv([
        process.env.PASSBOLT_API
      ])
      const url = `${process.env.PASSBOLT_API}${passboltPaths.resources}?contain[secret]=1&filter[has-parent]=${req.params.folderId}`
      const folderResourceResponse = await axios.get(url, {
        headers: {
          Cookie: req.body.cookie.join(";")
        },
        withCredentials: true
      })

      if (folderResourceResponse.status !== 200) {
        console.error(folderResourceResponse.data)
        throw new Error("Retrieving folder resources was not successfull.")
      }

      const secretsRepsonseArray: Record<string, any>[] = folderResourceResponse.data.body
      let repsonse: Object = {}

      for (let i = 0; i < secretsRepsonseArray.length; i++) {
        const object = secretsRepsonseArray[i]
        const secretPgpMessage = decodeURIComponent(object.secrets[0].data)
        const secret = await decryptPassboltMessage(secretPgpMessage)
        const parsed = JSON.parse(secret.toString()) as { password: string, description: string }
        repsonse = Object.assign(repsonse, repsonse, { [object.name]: parsed.password })
      }

      res.status(200).send(repsonse)
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        res.status(400).json({ message: error.message }).send()
        return
      }
      res.status(400).json({ message: `Unknown error: ${error}` }).send()
      return
    }
  })
