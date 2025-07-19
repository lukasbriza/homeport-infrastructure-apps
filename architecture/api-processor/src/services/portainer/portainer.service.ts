import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from 'axios'
import { validate } from 'class-validator'
import { firstValueFrom } from 'rxjs'
import { AddStackDto, RedeployStackDto } from '../../api/api.dto'
import { WithLogger } from '../../classes/with-logger'
import { LogMethod } from '../../decorators/log-method'
import { AppConfigTypes } from '../../types'
import { getErrorMessage, getValidationMessageFromErrorArray } from '../../utils'
import { EndpointDto, StackDto } from './portainer.dto'

@Injectable()
export class PortainerService extends WithLogger {
  constructor(
    private readonly configService: ConfigService<AppConfigTypes>,
    private readonly httpService: HttpService,
  ) {
    super(PortainerService.name)
  }

  @LogMethod()
  public async getStacks(): Promise<StackDto[]> {
    const portainerApi = this.configService.get<string>('PORTAINER_API')
    const portainerAcessToken = this.configService.get<string>('PORTAINER_API_ACESS_TOKEN')
    const url = `${portainerApi}/api/stacks`

    try {
      const response: AxiosResponse<StackDto[]> = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'X-API-KEY': portainerAcessToken,
          },
          withCredentials: true,
        }),
      )
      this.logger.log(`getStacks(): URL call ${url} ended with code: ${response.status}`)

      const validationErrors = await validate(response.data)
      const validationMessage = getValidationMessageFromErrorArray(validationErrors)

      if (validationMessage) {
        this.logger.log(`getStacks(): validation was not successfull: ${validationMessage}`)
        throw new Error(validationMessage)
      }

      this.logger.log(`getStacks(): validation was successfull`)
      return response.data
    } catch (error) {
      const message = getErrorMessage('getStacks', error)
      this.logger.error(`getStacks(): ended with error: \n ${JSON.stringify(error)}`)
      throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }
  }

  @LogMethod()
  public async createStack(stack: AddStackDto) {
    const portainerApi = this.configService.get<string>('PORTAINER_API')
    const portainerAcessToken = this.configService.get<string>('PORTAINER_API_ACESS_TOKEN')
    const url = `${portainerApi}/api/stacks/create/standalone/repository?endpointId=${stack.endpointId}`

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { endpointId, ...rest } = stack

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, rest, {
          timeout: 3_600_000,
          headers: {
            'X-API-KEY': portainerAcessToken,
          },
          withCredentials: true,
        }),
      )
      this.logger.log(`createStack(): URL call ${url} ended with code: ${response.status}`)

      if (response.status !== 200) {
        this.logger.log(`createStack(): request ended with code ${response.status}`)
        throw new Error(`Create stack request ended with code ${response.status}.`)
      }
    } catch (error) {
      const message = getErrorMessage('createStack', error)
      this.logger.error(`createStack(): ended with error: \n ${JSON.stringify(error)}`)
      throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }
  }

  @LogMethod()
  public async updateStack(stack: RedeployStackDto) {
    const portainerApi = this.configService.get<string>('PORTAINER_API')
    const portainerAcessToken = this.configService.get<string>('PORTAINER_API_ACESS_TOKEN')
    const url = `${portainerApi}/api/stacks/${stack.stackId}/git/redeploy?endpointId=${stack.endpointId}`
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { endpointId, stackId, ...rest } = stack

    try {
      const response = await firstValueFrom(
        this.httpService.put(url, rest, {
          timeout: 3_600_000,
          headers: {
            'X-API-KEY': portainerAcessToken,
          },
          withCredentials: true,
        }),
      )
      this.logger.log(`updateStack(): URL call ${url} ended with code: ${response.status}`)

      if (response.status !== 200) {
        this.logger.log(`updateStack(): request ended with code ${response.status}`)
        throw new Error(`Update stack request ended with code ${response.status}.`)
      }
    } catch (error) {
      const message = getErrorMessage('updateStack', error)
      this.logger.error(`updateStack(): ended with error: \n ${JSON.stringify(error)}`)
      throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }
  }

  @LogMethod()
  public async getEndpoints() {
    const portainerApi = this.configService.get<string>('PORTAINER_API')
    const portainerAcessToken = this.configService.get<string>('PORTAINER_API_ACESS_TOKEN')
    const url = `${portainerApi}/api/endpoints`

    try {
      const response: AxiosResponse<EndpointDto[]> = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 3_600_000,
          headers: {
            'X-API-KEY': portainerAcessToken,
          },
          withCredentials: true,
        }),
      )
      this.logger.log(`getEndpoints(): URL call ${url} ended with code: ${response.status}`)

      const validationErrors = await validate(response.data)
      const validationMessage = getValidationMessageFromErrorArray(validationErrors)

      if (validationMessage) {
        this.logger.log(`getEndpoints(): validation was not successfull: ${validationMessage}`)
        throw new Error(validationMessage)
      }

      this.logger.log(`getEndpoints(): validation was successfull`)

      return response.data
    } catch (error) {
      const message = getErrorMessage('getEndpoints', error)
      this.logger.error(`getEndpoints(): ended with error: \n ${JSON.stringify(error)}`)
      throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }
  }
}
