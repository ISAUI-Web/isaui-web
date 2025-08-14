import { PartialType } from '@nestjs/mapped-types';
import { CreateAspiranteDto } from './create-aspirante.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateAspiranteDto extends PartialType(CreateAspiranteDto) {
  @IsOptional()
  @IsString()
  @IsIn(['en espera', 'confirmado', 'rechazado'])
  estado_preinscripcion?: string;
}
