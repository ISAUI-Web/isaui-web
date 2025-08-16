import { IsString, IsEmail, IsEnum } from 'class-validator';
import { RolUsuario } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsString()
  nombre_usuario: string;

  @IsEmail()
  correo: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}
