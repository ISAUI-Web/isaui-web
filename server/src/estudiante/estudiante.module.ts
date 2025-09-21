import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './estudiante.entity';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { Matricula } from '../matricula/matricula.entity';
import { Documento } from '../documento/documento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Estudiante, Matricula, Documento])],
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService],
})
export class EstudianteModule {}
