/* eslint-disable no-console */
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
    console.group()
    console.log('getStacksResponse:')
    console.log(getStacksResponse.data)
    console.log('-------------------------------------------------------------------------------------')
    console.groupEnd()

    response.status(200).send(getStacksResponse.data)
  } catch (error) {
    console.log('getStacksResponse Error:')
    processRequestFailed(error, response)
    console.log('-------------------------------------------------------------------------------------')
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
        timeout: 3_600_000,
        headers: {
          'X-API-KEY': process.env.PORTAINER_API_ACESS_TOKEN,
        },
        withCredentials: true,
      })
      console.group()
      console.log('deployStackResponse:')
      console.log(deployStackResponse.data)
      console.log('-------------------------------------------------------------------------------------')
      console.groupEnd()

      response.status(200).send(deployStackResponse.data)
    } catch (error) {
      console.log('deployStackResponse Error:')
      processRequestFailed(error, response)
      console.log('-------------------------------------------------------------------------------------')
    }
  })
  .put(redeployStackValidation, async (request: Request<never, never, RedeployStackBody>, response: Response) => {
    try {
      verifyEnvironment([process.env.PORTAINER_API, process.env.PORTAINER_API_ACESS_TOKEN])
      const url = `${process.env.PORTAINER_API}${portainerPaths.redeployStack(request.body.stackId)}?endpointId=${request.body.endpointId}`
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { endpointId, stackId, ...restBody } = request.body

      const redeployStackResponse = await axios.put(url, restBody, {
        timeout: 3_600_000,
        headers: {
          'X-API-KEY': process.env.PORTAINER_API_ACESS_TOKEN,
        },
        withCredentials: true,
      })
      console.group()
      console.log('redeployStackResponse:')
      console.log(redeployStackResponse.data)
      console.log('-------------------------------------------------------------------------------------')
      console.groupEnd()

      response.status(200).send(redeployStackResponse.data)
    } catch (error) {
      console.log('redeployStackResponse Error:')
      processRequestFailed(error, response)
      console.log('-------------------------------------------------------------------------------------')
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
    console.group()
    console.log('getEndpointsResponse:')
    console.log(getEndpointsResponse.data)
    console.log('-------------------------------------------------------------------------------------')
    console.groupEnd()

    response.status(200).send(getEndpointsResponse.data)
  } catch (error) {
    console.log('getEndpointsResponse Error:')
    processRequestFailed(error, response)
    console.log('-------------------------------------------------------------------------------------')
  }
})
