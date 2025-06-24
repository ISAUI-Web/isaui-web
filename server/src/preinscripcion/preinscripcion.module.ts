import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preinscripcion } from './preinscripcion.entity';
import { PreinscripcionService } from './preinscripcion.service';
import { PreinscripcionController } from './preinscripcion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Preinscripcion])],
  controllers: [PreinscripcionController],
  providers: [PreinscripcionService],
})
export class PreinscripcionModule {}
