import { HttpService } from '@nestjs/axios'
import { HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosResponse } from 'axios'
import { validate } from 'class-validator'
import { firstValueFrom } from 'rxjs'
import { WithLogger } from '../../classes/with-logger'
import { LogMethod } from '../../decorators/log-method'
import { AppConfigTypes } from '../../types'
import { getErrorMessage, getValidationMessageFromErrorArray } from '../../utils'
import { GetSecretsDto, LoginDto } from './infisical.dto'

@Injectable({ scope: Scope.REQUEST })
export class InfisicalService extends WithLogger {
  private accessToken?: string = undefined

  constructor(
    private readonly configService: ConfigService<AppConfigTypes>,
    private readonly httpService: HttpService,
  ) {
    super(InfisicalService.name)
  }

  @LogMethod()
  private async login() {
    const infisicalApi = this.configService.get<string>('INFISICAL_API')
    const clientId = this.configService.get<string>('INFISICAL_CLIENT_ID')
    const clientSecret = this.configService.get<string>('INFISICAL_CLIENT_SECRET')
    const url = `${infisicalApi}/api/v1/auth/universal-auth/login`

    const params = new URLSearchParams()
    params.append('clientId', clientId ?? '')
    params.append('clientSecret', clientSecret ?? '')

    try {
      const response: AxiosResponse<LoginDto> = await firstValueFrom(
        this.httpService.post(url, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      )
      this.logger.log(`login(): URL call ${url} ended with code: ${response.status}`)
      const validationErrors = await validate(response.data)
      const validationMessage = getValidationMessageFromErrorArray(validationErrors)

      if (validationMessage) {
        this.logger.log(`login(): validation was not successfull: ${validationMessage}`)
        throw new Error(validationMessage)
      }

      this.logger.log(`login(): validation was successfull`)

      this.accessToken = response.data.accessToken
    } catch (error) {
      const message = getErrorMessage('login', error)
      this.logger.error(`login(): ended with error: \n ${JSON.stringify(error)}`)
      throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }
  }

  @LogMethod()
  public async getSecrets(platform: string, projectName: string, environment: string) {
    if (this.accessToken === undefined) {
      await this.login()
    }

    if (this.accessToken === undefined) {
      throw new HttpException('No accessToken assigned.', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    const infisicalApi = this.configService.get<string>('INFISICAL_API')
    const url = `${infisicalApi}/api/v3/secrets/raw?workspaceSlug=${platform}&environment=${environment}&secretPath=/${projectName}&recursive=true&include_imports=true`

    try {
      const response: AxiosResponse<GetSecretsDto> = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }),
      )
      this.logger.log(`getSecrets(): URL call ${url} ended with code: ${response.status}`)
      const validationErrors = await validate(response.data)
      const validationMessage = getValidationMessageFromErrorArray(validationErrors)

      if (validationMessage) {
        this.logger.log(`getSecrets(): validation was not successfull: ${validationMessage}`)
        throw new Error(validationMessage)
      }

      this.logger.log(`getSecrets(): validation was successfull`)

      const { secrets, imports } = response.data

      if (secrets.length === 0 && imports.length === 0) {
        throw new HttpException(
          `Secrets for configuration: platform - ${platform}, projectName - ${projectName} environment - ${environment}`,
          HttpStatus.BAD_REQUEST,
        )
      }

      const mergedSecrets = secrets

      for (const data of imports) {
        mergedSecrets.push(...data.secrets)
      }

      return mergedSecrets
    } catch (error) {
      const message = getErrorMessage('getSecrets', error)
      this.logger.error(`getSecrets(): ended with error: \n ${JSON.stringify(error)}`)
      throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }
  }
}
