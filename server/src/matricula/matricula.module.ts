import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matricula } from './matricula.entity';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';
import { ConstanciaModule } from '../constancia/constancia.module';
import { Carrera } from '../carrera/carrera.entity';
import { EstudianteModule } from '../estudiante/estudiante.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aspirante, Preinscripcion, Matricula, Carrera]), // 👈 IMPORTANTE
    ConstanciaModule,
    EstudianteModule,
  ],
  controllers: [MatriculaController],
  providers: [MatriculaService],
  exports: [MatriculaService],
})
export class MatriculaModule {}
