import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from './usuario.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  // 🔑 LOGIN
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

  // 📌 CRUD
  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepo.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async create(data: CreateUsuarioDto): Promise<Usuario> {
    // Verificar duplicado
    const existe = await this.usuarioRepo.findOne({
      where: { nombre_usuario: data.nombre_usuario },
    });
    if (existe) {
      throw new Error(`El usuario "${data.nombre_usuario}" ya existe`);
    }

    const usuario = new Usuario();
    usuario.nombre_usuario = data.nombre_usuario;
    usuario.rol = data.rol;

    // Contraseña por defecto "1234" hasheada
    const contraseñaPorDefecto = "1234";
    const salt = await bcrypt.genSalt(10);
    usuario.contraseña_hash = await bcrypt.hash(contraseñaPorDefecto, salt);

    return this.usuarioRepo.save(usuario);
  }

  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (data.nombre_usuario) {
      // Validar que no se repita el nombre de usuario
      const existe = await this.usuarioRepo.findOne({
        where: { nombre_usuario: data.nombre_usuario },
      });
      if (existe && existe.id !== id) {
        throw new Error(`El usuario "${data.nombre_usuario}" ya existe`);
      }
      usuario.nombre_usuario = data.nombre_usuario;
    }

    if (data.rol) usuario.rol = data.rol;

    return this.usuarioRepo.save(usuario);
  }

  async resetPassword(id: number) {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Reiniciar a "1234"
    const contraseñaPorDefecto = "1234";
    const salt = await bcrypt.genSalt(10);
    usuario.contraseña_hash = await bcrypt.hash(contraseñaPorDefecto, salt);

    return this.usuarioRepo.save(usuario);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usuarioRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
