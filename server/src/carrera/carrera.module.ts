import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrera } from './carrera.entity';
import { CarreraService } from './carrera.service';
import { CarreraController } from './carrera.controller';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrera, Preinscripcion]), // 🔹 ambos aquí
  ],
  controllers: [CarreraController],
  providers: [CarreraService],
})
export class CarreraModule {}