import { Controller, Post, Body } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { LoginUsuarioDto } from './dto/login-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('login')
  async login(@Body() loginDto: LoginUsuarioDto) {
    return this.usuarioService.validarUsuario(
      loginDto.nombre_usuario,
      loginDto.contraseña,
    );
  }
}
