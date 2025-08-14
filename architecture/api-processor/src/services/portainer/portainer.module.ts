import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PortainerService } from './portainer.service'

@Module({
  imports: [HttpModule],
  providers: [PortainerService],
  exports: [PortainerService],
})
export class PortainerModule {}
