import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aspirante } from './aspirante.entity';
import { AspiranteService } from './aspirante.service';
import { AspiranteController } from './aspirante.controller';
import { DocumentoModule } from '../documento/documento.module';
import { PreinscripcionModule } from '../preinscripcion/preinscripcion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aspirante]),
    DocumentoModule,
    PreinscripcionModule,
  ],
  controllers: [AspiranteController],
  providers: [AspiranteService],
})
export class AspiranteModule {}
