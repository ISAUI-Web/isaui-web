import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aspirante } from './aspirante.entity';
import { AspiranteService } from './aspirante.service';
import { AspiranteController } from './aspirante.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Aspirante])],
  controllers: [AspiranteController],
  providers: [AspiranteService],
})
export class AspiranteModule {}
