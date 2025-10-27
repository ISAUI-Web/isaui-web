import { PartialType } from '@nestjs/mapped-types';
import { CreateAspiranteDto } from './create-aspirante.dto';
import { IsOptional, IsString, IsIn, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAspiranteDto extends PartialType(CreateAspiranteDto) {
  @IsOptional()
  @IsString()
  @IsIn(['pendiente', 'en espera', 'confirmado', 'rechazado'])
  estado_preinscripcion?: string;

  // SOLUCIÓN: Se añade el campo aquí para controlar la transformación explícitamente.
  // Este transformador se ejecuta ANTES que los validadores heredados de CreateAspiranteDto.
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? null : value,
  )
  @IsOptional()
  @IsNumber() // Mantenemos la validación de tipo por si se envía un valor no nulo.
  horas_diarias?: number | null;
}
