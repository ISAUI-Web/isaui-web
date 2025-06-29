import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './documento.entity';
import { DocumentoService } from './documento.service';
import { DocumentoController } from './documento.controller';
import { LegajoEstudiante } from '../legajo-estudiante/legajo-estudiante.entity';
import { LegajoDocente } from '../legajo-docente/legajo-docente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documento, LegajoEstudiante, LegajoDocente]),
  ],
  controllers: [DocumentoController],
  providers: [DocumentoService],
  exports: [TypeOrmModule, DocumentoService],
})
export class DocumentoModule {}
