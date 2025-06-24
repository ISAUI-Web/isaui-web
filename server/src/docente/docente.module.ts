import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './docente.entity';
import { DocenteService } from './docente.service';
import { DocenteController } from './docente.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Docente])],
  controllers: [DocenteController],
  providers: [DocenteService],
})
export class DocenteModule {}
