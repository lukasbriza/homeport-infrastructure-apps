import { Router, Request, Response } from "express"
import axios from "axios"
import { authenticate } from "../middlewares/passbolt"
import { passboltPaths } from "../paths"
import { verifyEnv } from "../utils"

export const passbolt = Router()

passbolt
  .route("/folder-secrets/:folderId")
  .get(authenticate, async (req: Request, res: Response) => {
    try {
      verifyEnv([
        process.env.PASSBOLT_API
      ])
      const url = `${process.env.PASSBOLT_API}${passboltPaths.resources}?contain[secret]=1&filter[has-parent]=${req.params.folderId}`
      console.log("here")
      const folderResourceResponse = await axios.get(url)
      console.log(folderResourceResponse)

      if (folderResourceResponse.status !== 200) {
        console.error(folderResourceResponse.data)
        throw new Error("Retrieving folder resources was not successfull.")
      }


      res.status(200).send()
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
