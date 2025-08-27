import { IsString, IsInt, Min, MaxLength, IsBoolean } from 'class-validator';

export class CreateCarreraDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  @IsInt({ message: 'El cupo máximo debe ser un número entero' })
  @Min(0, { message: 'El cupo máximo no puede ser negativo' })
  cupo_maximo: number;

  @IsInt({ message: 'El cupo actual debe ser un número entero' })
  @Min(0, { message: 'El cupo actual no puede ser negativo' })
  cupo_actual: number;

  @IsBoolean()
  activo: boolean;
}
