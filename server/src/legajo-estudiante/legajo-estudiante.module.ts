import { Module } from '@nestjs/common';
import { LegajoEstudianteService } from './legajo-estudiante.service';
import { LegajoEstudianteController } from './legajo-estudiante.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';
import { Matricula } from '../matricula/matricula.entity';
import { Estudiante } from '../estudiante/estudiante.entity';
import { AspiranteModule } from '../aspirante/aspirante.module';
import { DocumentoModule } from '../documento/documento.module';
import { MatriculaModule } from '../matricula/matricula.module';
import { EstudianteModule } from '../estudiante/estudiante.module';
import { CarreraModule } from '../carrera/carrera.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Aspirante,
      Preinscripcion,
      Matricula,
      Estudiante,
    ]),
    AspiranteModule,
    DocumentoModule,
    MatriculaModule,
    EstudianteModule,
    CarreraModule,
  ],
  controllers: [LegajoEstudianteController],
  providers: [LegajoEstudianteService],
})
export class LegajoEstudianteModule {}
