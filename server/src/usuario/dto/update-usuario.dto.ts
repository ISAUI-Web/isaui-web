import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { RolUsuario } from '../usuario.entity';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre_usuario?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;
}
