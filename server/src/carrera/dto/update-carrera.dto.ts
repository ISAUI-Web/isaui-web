import { PartialType } from '@nestjs/mapped-types';
import { CreateCarreraDto } from './create-carrera.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCarreraDto extends PartialType(CreateCarreraDto) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}