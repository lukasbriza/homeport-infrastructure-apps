/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsString, IsNumber, ValidateNested, IsBoolean, IsArray, IsOptional } from 'class-validator'

export class Secret {
  @ApiProperty()
  name: string
  @ApiProperty()
  value: string
}

export class StackDto {
  @ApiProperty()
  @IsNumber()
  Id: number
  @ApiProperty()
  @IsString()
  Name: string
  @ApiProperty()
  @IsNumber()
  Type: number
  @ApiProperty()
  @IsString()
  EndpointId: number
  @ApiProperty({ type: [Secret] })
  Env: Secret[]
}

class Gpu {
  @ApiProperty()
  @IsString()
  name: string
  @ApiProperty()
  @IsString()
  value: string
}

class SecuritySettings {
  @ApiProperty()
  @IsBoolean()
  allowBindMountsForRegularUsers: boolean
  @ApiProperty()
  @IsBoolean()
  allowContainerCapabilitiesForRegularUsers: boolean
  @ApiProperty()
  @IsBoolean()
  allowDeviceMappingForRegularUsers: boolean
  @ApiProperty()
  @IsBoolean()
  allowHostNamespaceForRegularUsers: boolean
  @ApiProperty()
  @IsBoolean()
  allowPrivilegedModeForRegularUsers: boolean
  @ApiProperty()
  @IsBoolean()
  allowStackManagementForRegularUsers: boolean
  @ApiProperty()
  @IsBoolean()
  allowSysctlSettingForRegularUsers: boolean
  @ApiProperty()
  @IsBoolean()
  allowVolumeBrowserForRegularUsers: boolean
  @ApiProperty()
  @IsBoolean()
  enableHostManagementFeatures: boolean
}

export class EndpointDto {
  @ApiProperty()
  @IsString()
  AMTDeviceGUID: string
  @ApiProperty({ isArray: true, type: 'number' })
  @IsArray()
  AuthorizedTeams: number[]
  @ApiProperty({ isArray: true, type: 'number' })
  @IsArray()
  AuthorizedUsers: number[]
  AzureCredentials: unknown
  @ApiProperty()
  @IsString()
  ComposeSyntaxMaxVersion: string
  @ApiProperty()
  @IsString()
  ContainerEngine: string
  @ApiProperty()
  @IsNumber()
  EdgeCheckinInterval: number
  @ApiProperty()
  @IsString()
  EdgeID: string
  @ApiProperty()
  @IsString()
  EdgeKey: string
  EnableGPUManagement: boolean
  @ApiProperty({ type: [Gpu], nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  Gpus: Gpu[] | null
  @ApiProperty()
  @IsNumber()
  GroupId: number
  @ApiProperty()
  @IsBoolean()
  Heartbeat: boolean
  @ApiProperty()
  @IsNumber()
  Id: number
  @ApiProperty()
  @IsBoolean()
  IsEdgeDevice: boolean
  Kubernetes: unknown
  @ApiProperty()
  @IsString()
  Name: string
  PostInitMigrations: unknown
  @ApiProperty()
  @IsString()
  PublicURL: string
  Snapshots: unknown
  @ApiProperty()
  @IsNumber()
  Status: number
  @ApiProperty()
  @IsBoolean()
  TLS: boolean
  @ApiProperty()
  @IsString()
  TLSCACert: string
  @ApiProperty()
  @IsString()
  TLSCert: string
  TLSConfig: unknown
  @ApiProperty()
  @IsString()
  TLSKey: string
  @ApiProperty()
  @IsArray()
  TagIds: number[]
  @ApiProperty()
  @IsArray()
  Tags: string[]
  TeamAccessPolicies: unknown
  @ApiProperty()
  @IsNumber()
  Type: number
  @ApiProperty()
  @IsString()
  URL: string
  UserAccessPolicies: unknown
  @ApiProperty()
  @IsBoolean()
  UserTrusted: boolean
  agent: unknown
  edge: unknown
  @ApiProperty()
  @IsNumber()
  lastCheckInDate: number
  @ApiProperty()
  @IsNumber()
  queryDate: number
  @ApiProperty({ type: SecuritySettings })
  @Type(() => SecuritySettings)
  securitySettings: SecuritySettings
}
