import { IsString, IsEnum } from 'class-validator';
import { RolUsuario } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsString()
  nombre_usuario: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}
