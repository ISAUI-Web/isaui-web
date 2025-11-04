import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  contrasena_actual: string;

  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  nueva_contrasena: string;

  @IsString()
  @IsNotEmpty({ message: 'Debe confirmar la nueva contraseña' })
  confirmar_nueva_contrasena: string;
}