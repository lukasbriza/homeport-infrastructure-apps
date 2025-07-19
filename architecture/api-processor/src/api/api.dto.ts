/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator'
import { Secret } from '../services/portainer/portainer.dto'

export class AutoUpdate {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  forcePullImage?: boolean
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  forceUpdate?: boolean
  @ApiProperty()
  @IsString()
  @IsOptional()
  interval?: string
  @ApiProperty()
  @IsString()
  @IsOptional()
  jobID?: string
  @ApiProperty()
  @IsString()
  @IsOptional()
  webhook?: string
}

class StackBaseDto {
  @ApiProperty()
  @IsDefined()
  endpointId: string
  @ApiProperty()
  @IsBoolean()
  repositoryAuthentication: boolean
  @ApiProperty()
  @IsString()
  repositoryUsername: string
  @ApiProperty()
  @IsString()
  repositoryPassword: string
  @ApiProperty()
  @IsString()
  repositoryReferenceName: string
}

export class RedeployStackDto extends StackBaseDto {
  @ApiProperty()
  @IsDefined()
  stackId: string
  @ApiProperty()
  @IsBoolean()
  prune: boolean
  @ApiProperty()
  @IsBoolean()
  pullImage: boolean
  @ApiProperty({ type: [Secret], nullable: true })
  @IsArray()
  @IsOptional()
  env: Secret[] | null
}

export class AddStackDto extends StackBaseDto {
  @ApiProperty()
  @IsString()
  name: string
  @ApiProperty()
  @IsString()
  repositoryURL: string
  @ApiProperty()
  @IsString()
  composeFile: string
  @ApiProperty()
  @IsBoolean()
  tlsskipVerify: boolean
  @ApiProperty()
  @IsBoolean()
  fromAppTemplate: boolean
  @ApiProperty({ type: AutoUpdate, nullable: true })
  @Type(() => AutoUpdate)
  @IsOptional()
  autoUpdate: AutoUpdate | null
  @ApiProperty({ type: [String], nullable: true })
  @IsArray()
  @IsOptional()
  additionalFiles?: string[] | null
  @ApiProperty({ type: [Secret], nullable: true })
  @IsArray()
  @IsOptional()
  env: Secret[] | null
}
