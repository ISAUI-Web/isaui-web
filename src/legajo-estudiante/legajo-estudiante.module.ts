import { Module } from '@nestjs/common';
import { LegajoEstudianteService } from './legajo-estudiante.service';
import { LegajoEstudianteController } from './legajo-estudiante.controller';

@Module({
  controllers: [LegajoEstudianteController],
  providers: [LegajoEstudianteService],
})
export class LegajoEstudianteModule {}
