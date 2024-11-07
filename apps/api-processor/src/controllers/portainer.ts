import axios from 'axios'
import type { Request, Response } from 'express'
import { Router } from 'express'
import { deployStackValidation, redeployStackValidation } from '../middlewares/validation'
import { portainerPaths } from '../paths'
import type { AddStackBody, RedeployStackBody } from '../types'
import { processRequestFailed, verifyEnvironment } from '../utils'

export const portainer = Router()

portainer.route('/stacks').get(async (_: Request, response: Response) => {
  try {
    verifyEnvironment([process.env.PORTAINER_API, process.env.PORTAINER_API_ACESS_TOKEN])
    const url = `${process.env.PORTAINER_API}${portainerPaths.getStacks}`
    const getStacksResponse = await axios.get(url, {
      headers: {
        'X-API-KEY': process.env.PORTAINER_API_ACESS_TOKEN,
      },
      withCredentials: true,
    })

    if (getStacksResponse.status !== 200) {
      console.error(getStacksResponse.data)
      throw new Error('Retrieving portainer stacks failed.')
    }

    response.status(200).send(getStacksResponse.data)
  } catch (error) {
    processRequestFailed(error, response)
  }
})

portainer
  .route('/stack')
  .post(deployStackValidation, async (request: Request<never, never, AddStackBody>, response: Response) => {
    try {
      verifyEnvironment([process.env.PORTAINER_API, process.env.PORTAINER_API_ACESS_TOKEN])
      const url = `${process.env.PORTAINER_API}${portainerPaths.deployStack}?endpointId=${request.body.endpointId}`
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { endpointId, ...restBody } = request.body

      const deployStackResponse = await axios.post(url, restBody, {
        headers: {
          'X-API-KEY': process.env.PORTAINER_API_ACESS_TOKEN,
        },
        withCredentials: true,
      })

      if (deployStackResponse.status !== 200) {
        console.error(deployStackResponse.data)
        throw new Error('Deploying portainer stacks failed.')
      }

      response.status(200).send(deployStackResponse.data)
    } catch (error) {
      processRequestFailed(error, response)
    }
  })
  .put(redeployStackValidation, async (request: Request<never, never, RedeployStackBody>, response: Response) => {
    try {
      verifyEnvironment([process.env.PORTAINER_API, process.env.PORTAINER_API_ACESS_TOKEN])
      const url = `${process.env.PORTAINER_API}${portainerPaths.redeployStack(request.body.stackId)}?endpointId=${request.body.endpointId}`
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { endpointId, stackId, ...restBody } = request.body

      const redeployStackResponse = await axios.put(url, restBody, {
        headers: {
          'X-API-KEY': process.env.PORTAINER_API_ACESS_TOKEN,
        },
        withCredentials: true,
      })

      if (redeployStackResponse.status !== 200) {
        console.error(redeployStackResponse.data)
        throw new Error('Deploying portainer stacks failed.')
      }

      response.status(200).send(redeployStackResponse.data)
    } catch (error) {
      processRequestFailed(error, response)
    }
  })

portainer.route('/endpoints').get(async (_: Request, response: Response) => {
  try {
    verifyEnvironment([process.env.PORTAINER_API, process.env.PORTAINER_API_ACESS_TOKEN])
    const url = `${process.env.PORTAINER_API}${portainerPaths.getEndpoints}`

    const getEndpointsResponse = await axios.get(url, {
      headers: {
        'X-API-KEY': process.env.PORTAINER_API_ACESS_TOKEN,
      },
      withCredentials: true,
    })

    if (getEndpointsResponse.status !== 200) {
      console.error(getEndpointsResponse.data)
      throw new Error('Retrieving portainer endpoints failed.')
    }

    response.status(200).send(getEndpointsResponse.data)
  } catch (error) {
    processRequestFailed(error, response)
  }
})
