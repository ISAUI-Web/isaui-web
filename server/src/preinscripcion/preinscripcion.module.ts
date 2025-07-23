import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preinscripcion } from './preinscripcion.entity';
import { PreinscripcionService } from './preinscripcion.service';
import { PreinscripcionController } from './preinscripcion.controller';
import { Aspirante } from 'src/aspirante/aspirante.entity';
import { ConstanciaService } from 'src/constancia/constancia.service';

@Module({
  imports: [TypeOrmModule.forFeature([Preinscripcion, Aspirante])],
  controllers: [PreinscripcionController],
  providers: [PreinscripcionService, ConstanciaService],
  exports: [PreinscripcionService],
})
export class PreinscripcionModule {}
