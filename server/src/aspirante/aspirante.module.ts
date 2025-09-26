import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aspirante } from './aspirante.entity';
import { AspiranteService } from './aspirante.service';
import { AspiranteController } from './aspirante.controller';
import { DocumentoModule } from '../documento/documento.module';
import { PreinscripcionModule } from '../preinscripcion/preinscripcion.module';
import { ConstanciaModule } from '../constancia/constancia.module';
import { MatriculaModule } from '../matricula/matricula.module';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';
import { Carrera } from '../carrera/carrera.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aspirante, Preinscripcion, Carrera]),
    DocumentoModule,
    PreinscripcionModule,
    ConstanciaModule,
    MatriculaModule,
  ],
  controllers: [AspiranteController],
  providers: [AspiranteService],
  exports: [AspiranteService],
})
export class AspiranteModule {}
