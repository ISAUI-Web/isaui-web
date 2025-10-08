import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './docente.entity';
import { DocenteService } from './docente.service';
import { DocenteController } from './docente.controller';
import { DocumentoModule } from '../documento/documento.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Docente]),
    forwardRef(() => DocumentoModule),
  ],
  controllers: [DocenteController],
  providers: [DocenteService],
  exports: [DocenteService],
})
export class DocenteModule {}
