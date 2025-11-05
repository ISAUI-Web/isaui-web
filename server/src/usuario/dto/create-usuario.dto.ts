import { IsString, IsEnum, IsOptional, Length } from 'class-validator';
import { RolUsuario } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsString()
  nombre_usuario: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;

  @IsOptional()
  @IsString()
  @Length(7, 8)
  dni?: string;
}
