/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'

export class LoginDto {
  @ApiProperty()
  @IsString()
  accessToken: string
  @ApiProperty()
  @IsNumber()
  expiresIn: number
  @ApiProperty()
  @IsNumber()
  accessTokenMaxTTL: number
  @ApiProperty()
  @IsString()
  tokenType: string
}

class Metadata {
  @ApiProperty()
  @IsString()
  key: string
  @ApiProperty()
  @IsString()
  value: string
}

class Tag {
  @ApiProperty()
  @IsString()
  id: string
  @ApiProperty()
  @IsString()
  slug: string
  @ApiProperty()
  @IsString()
  name: string
  @ApiProperty()
  @IsString()
  @IsOptional()
  color: string | null
}

export class SecretDto {
  @ApiProperty()
  @IsString()
  id: string
  @ApiProperty()
  @IsString()
  _id: string
  @ApiProperty()
  @IsString()
  workspace: string
  @ApiProperty()
  @IsString()
  environment: string
  @ApiProperty()
  @IsNumber()
  version: number
  @ApiProperty()
  @IsString()
  type: string
  @ApiProperty()
  @IsString()
  secretKey: string
  @ApiProperty()
  @IsString()
  secretValue: string
  @ApiProperty()
  @IsString()
  secretComment: string
  @ApiProperty()
  @IsString()
  @IsOptional()
  secretReminderNote: string | null
  @ApiProperty()
  @IsString()
  @IsOptional()
  secretReminderRepeatDays: string | null
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  skipMultilineEncoding: boolean | null
  @ApiProperty()
  @IsString()
  createdAt: string
  @ApiProperty()
  @IsString()
  updatedAt: string
  @ApiProperty()
  @IsBoolean()
  isRotatedSecret: boolean
  @ApiProperty()
  @IsString()
  @IsOptional()
  rotationId: string | null
  @ApiProperty()
  @IsString()
  secretPath: string
  @ApiProperty()
  @IsBoolean()
  secretValueHidden: boolean
  @ValidateNested({ each: true })
  @Type(() => Metadata)
  @ApiProperty({ type: [Metadata] })
  secretMetadata: Metadata[]
  @ValidateNested({ each: true })
  @Type(() => Tag)
  @ApiProperty({ type: [Tag] })
  tags: Tag[]
}

class Import {
  @ApiProperty()
  @IsString()
  secretPath: string
  @ApiProperty()
  @IsString()
  environment: string
  @ApiProperty()
  @IsString()
  folderId: string
  @ValidateNested({ each: true })
  @Type(() => Tag)
  @ApiProperty({ type: [SecretDto] })
  secrets: SecretDto[]
}

export class GetSecretsDto {
  @ValidateNested({ each: true })
  @Type(() => Tag)
  @ApiProperty({ type: [SecretDto] })
  secrets: SecretDto[]
  @ValidateNested({ each: true })
  @Type(() => Tag)
  @ApiProperty({ type: [Import] })
  imports: Import[]
}
