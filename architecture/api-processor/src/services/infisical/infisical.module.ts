import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { InfisicalService } from './infisical.service'

@Module({
  imports: [HttpModule],
  providers: [InfisicalService],
  exports: [InfisicalService],
})
export class InfisicalModule {}
