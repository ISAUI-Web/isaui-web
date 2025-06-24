import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matricula } from './matricula.entity';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Matricula])],
  controllers: [MatriculaController],
  providers: [MatriculaService],
})
export class MatriculaModule {}
