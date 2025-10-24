import { Injectable, UnauthorizedException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from './usuario.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  /**
   * Este método se ejecuta una vez que el módulo de usuario se ha inicializado.
   * Es el lugar perfecto para crear el usuario administrador si no existe.
   */
  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminExists = await this.usuarioRepo.findOne({ where: { rol: RolUsuario.ADMIN_GENERAL } });

    if (!adminExists) {
      console.log('Admin user not found, seeding...');
      const adminUser = this.usuarioRepo.create({
        nombre_usuario: process.env.ADMIN_USER || 'admin',
        rol: RolUsuario.ADMIN_GENERAL,
        activo: true,
      });

      const salt = await bcrypt.genSalt(10);
      adminUser.contraseña_hash = await bcrypt.hash(process.env.ADMIN_PASS || 'admin123', salt);
      await this.usuarioRepo.save(adminUser);
      console.log('Admin user seeded successfully.');
    }
  }

  // 🔑 LOGIN
 async validarUsuario(nombre_usuario: string, contraseña: string) {
  // 1. Buscar usuario por nombre de usuario
  const usuario = await this.usuarioRepo.findOne({
    where: { nombre_usuario },
  });

  if (!usuario) {
    throw new UnauthorizedException('Usuario o contraseña incorrectos');
  }

  // 2. Verificar contraseña
  const esValida = await bcrypt.compare(contraseña, usuario.contraseña_hash);
  if (!esValida) {
    throw new UnauthorizedException('Usuario o contraseña incorrectos');
  }

  // 3. Crear el payload para el token
  const payload = { sub: usuario.id, rol: usuario.rol };

  // 4. Generar JWT (puedes agregar expiresIn en el módulo JWT)
  const token = await this.jwtService.signAsync(payload);

  // 5. Retornar los datos esenciales
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

  async updateActivo(id: number, activo: boolean): Promise<Usuario> {
  const usuario = await this.usuarioRepo.findOne({ where: { id } });
  if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

  usuario.activo = activo; // asigna directamente lo que viene
  return this.usuarioRepo.save(usuario); // guarda en DB y devuelve el usuario actualizado
}

  async remove(id: number): Promise<void> {
    const result = await this.usuarioRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
