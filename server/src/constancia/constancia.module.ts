import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstanciaController } from './constancia.controller';
import { ConstanciaService } from './constancia.service';
import { Aspirante } from '../aspirante/aspirante.entity'; // ajustá la ruta si es necesario

@Module({
  imports: [
    TypeOrmModule.forFeature([Aspirante]), // Esto importa el repositorio de Aspirante
  ],
  controllers: [ConstanciaController],
  providers: [ConstanciaService],
  exports: [ConstanciaService],
})
export class ConstanciaModule {}
