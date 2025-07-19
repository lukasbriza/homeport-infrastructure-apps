import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Query } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { validate } from 'class-validator'
import { SecretDto } from '../services/infisical/infisical.dto'
import { InfisicalService } from '../services/infisical/infisical.service'
import { EndpointDto, StackDto } from '../services/portainer/portainer.dto'
import { PortainerService } from '../services/portainer/portainer.service'
import { getErrorMessage, getValidationMessageFromErrorArray } from '../utils'
import { AddStackDto, RedeployStackDto } from './api.dto'

@ApiTags('api')
@Controller('api')
export class ApiController {
  constructor(
    private readonly portainerService: PortainerService,
    private readonly infisicalService: InfisicalService,
  ) {}

  @ApiOperation({ summary: 'Get stack' })
  @ApiOkResponse({
    status: 200,
    type: [StackDto],
  })
  @Get('portainer/stacks')
  public async getPortainerStacks(): Promise<StackDto[]> {
    const stacks = await this.portainerService.getStacks()
    return stacks
  }

  @ApiOperation({ summary: 'Add stack' })
  @ApiBody({ type: AddStackDto })
  @ApiOkResponse({ status: 200 })
  @Post('portainer/stack')
  public async deployPortainerStack(@Body() stack: AddStackDto): Promise<void> {
    try {
      const validationErrors = await validate(stack)
      const validationMessage = getValidationMessageFromErrorArray(validationErrors)

      if (validationMessage) {
        throw new Error(validationMessage)
      }
    } catch (error) {
      const message = getErrorMessage('deployPortainerStack', error)
      throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }

    await this.portainerService.createStack(stack)
  }

  @ApiOperation({ summary: 'Redeploy stack' })
  @ApiBody({ type: RedeployStackDto })
  @ApiOkResponse({ status: 200 })
  @Put('portainer/stack')
  public async redeployPortainerStack(@Body() stack: RedeployStackDto) {
    try {
      const validationErrors = await validate(stack)
      const validationMessage = getValidationMessageFromErrorArray(validationErrors)

      if (validationMessage) {
        throw new Error(validationMessage)
      }
    } catch (error) {
      const message = getErrorMessage('redeployPortainerStack', error)
      throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }

    await this.portainerService.updateStack(stack)
  }

  @ApiOperation({ summary: 'Get endpoints' })
  @ApiOkResponse({ status: 200, type: [EndpointDto] })
  @Get('portainer/endpoints')
  public async getPortainerEndpoints() {
    const endpoints = await this.portainerService.getEndpoints()
    return endpoints
  }

  @ApiOperation({ summary: 'Get secrets for project' })
  @ApiOkResponse({ status: 200, type: [SecretDto] })
  @ApiQuery({ name: 'platform', type: String, required: true })
  @ApiQuery({ name: 'projectName', type: String, required: true })
  @ApiQuery({ name: 'environment', type: String, required: true })
  @Get('infisical/secrets')
  public async getInfisicalSecrets(
    @Query('platform') platform: string,
    @Query('projectName') projectName: string,
    @Query('environment') environment: string,
  ) {
    const secrets = await this.infisicalService.getSecrets(platform, projectName, environment)
    return secrets
  }

  @Get('health')
  public healthCheck() {
    return true
  }
}
