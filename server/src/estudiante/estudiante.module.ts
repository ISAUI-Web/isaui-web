import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './estudiante.entity';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { DocumentoModule } from '../documento/documento.module';
import { Matricula } from '../matricula/matricula.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estudiante, Matricula]),
    forwardRef(() => DocumentoModule),
  ],
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService],
})
export class EstudianteModule {}
