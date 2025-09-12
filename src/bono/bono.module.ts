import { Module } from '@nestjs/common';
import { BonoService } from './bono.service';
import { BonoController } from './bono.controller';

@Module({
  providers: [BonoService],
  controllers: [BonoController]
})
export class BonoModule {}
