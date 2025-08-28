import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matricula } from './matricula.entity';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aspirante, Preinscripcion, Matricula]), // 👈 IMPORTANTE
  ],
  controllers: [MatriculaController],
  providers: [MatriculaService],
  exports: [MatriculaService],
})
export class MatriculaModule {}
