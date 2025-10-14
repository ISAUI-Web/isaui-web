import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './curso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Curso])],
  // No se necesitan controladores ni proveedores si es solo una entidad de datos
  exports: [TypeOrmModule], // Exportamos para que otros módulos puedan usar el repositorio de Curso
})
export class CursoModule {}
