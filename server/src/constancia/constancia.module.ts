import { Module } from '@nestjs/common';
import { ConstanciaController } from './constancia.controller';
import { ConstanciaService } from './constancia.service';

@Module({
  controllers: [ConstanciaController],
  providers: [ConstanciaService],
})
export class ConstanciaModule {}