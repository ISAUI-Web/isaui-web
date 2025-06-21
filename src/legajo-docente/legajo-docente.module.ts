import { Module } from '@nestjs/common';
import { LegajoDocenteService } from './legajo-docente.service';
import { LegajoDocenteController } from './legajo-docente.controller';

@Module({
  controllers: [LegajoDocenteController],
  providers: [LegajoDocenteService],
})
export class LegajoDocenteModule {}
