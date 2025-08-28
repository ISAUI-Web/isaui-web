import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { RolUsuario } from '../usuario.entity';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre_usuario?: string;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
