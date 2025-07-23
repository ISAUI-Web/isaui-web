import { IsInt } from 'class-validator';
export class CreatePreinscripcionDto {
  @IsInt()
  aspirante_id: number;

  @IsInt()
  carrera_id: number;
}
