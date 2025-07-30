import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(nombre_usuario: string, contraseña: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { nombre_usuario },
    });
    if (!usuario)
      throw new UnauthorizedException('Usuario o contraseña incorrectos');

    const esValida = await bcrypt.compare(contraseña, usuario.contraseña_hash);
    if (!esValida)
      throw new UnauthorizedException('Usuario o contraseña incorrectos');

    // Generar JWT
    const payload = { sub: usuario.id, rol: usuario.rol };
    const token = await this.jwtService.signAsync(payload);

    return {
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        rol: usuario.rol,
        nombre_usuario: usuario.nombre_usuario,
      },
    };
  }
}
