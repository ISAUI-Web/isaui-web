import { Module } from '@nestjs/common';
import { LegajoDocenteService } from './legajo-docente.service';
import { LegajoDocenteController } from './legajo-docente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegajoDocente } from './legajo-docente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LegajoDocente])],
  controllers: [LegajoDocenteController],
  providers: [LegajoDocenteService],
})
export class LegajoDocenteModule {}
