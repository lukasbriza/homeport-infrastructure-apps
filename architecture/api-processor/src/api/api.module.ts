import { Module } from '@nestjs/common'
import { InfisicalModule } from '../services/infisical/infisical.module'
import { PortainerModule } from '../services/portainer/portainer.module'
import { ApiController } from './api.controller'

@Module({
  imports: [PortainerModule, InfisicalModule],
  providers: [ApiController],
  controllers: [ApiController],
})
export class ApiModule {}
