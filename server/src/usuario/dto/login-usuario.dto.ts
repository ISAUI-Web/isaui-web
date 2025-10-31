import { IsString } from 'class-validator';

export class LoginUsuarioDto {
  @IsString()
  nombre_usuario: string;

  @IsString()
  contrasena: string;
}
