import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Aspirante, Preinscripcion]) // 👈 IMPORTANTE
  ],
  controllers: [MatriculaController],
  providers: [MatriculaService],
})
export class MatriculaModule {}
