import { Injectable, UnauthorizedException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from './usuario.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/update-contrasena.dto';

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
  async validarUsuario(nombre_usuario: string, contrasena: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { nombre_usuario },
    });
    if (!usuario)
      throw new UnauthorizedException('Usuario o contraseña incorrectos');

    const esValida = await bcrypt.compare(contrasena, usuario.contraseña_hash);
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
        dni: usuario.dni, // Devolvemos el DNI en el login
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
      throw new Error(`El nombre de usuario "${data.nombre_usuario}" ya existe`);
    }

    // Creamos la instancia sin el DNI inicialmente para manejarlo explícitamente.
    const usuario = this.usuarioRepo.create({
      nombre_usuario: data.nombre_usuario,
      rol: data.rol,
    });

    // Asignar DNI solo si el rol es PROFESOR y el DNI fue proporcionado.
    usuario.dni = data.rol === RolUsuario.PROFESOR ? (data.dni || null) : null;

    // Hashear contraseña por defecto "1234"
    const contrasenaPorDefecto = "1234";
    const salt = await bcrypt.genSalt(10);
    usuario.contraseña_hash = await bcrypt.hash(contrasenaPorDefecto, salt);

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
    const contrasenaPorDefecto = "1234";
    const salt = await bcrypt.genSalt(10);
    usuario.contraseña_hash = await bcrypt.hash(contrasenaPorDefecto, salt);

    return this.usuarioRepo.save(usuario);
  }

  async updateActivo(id: number, activo: boolean): Promise<Usuario> {
  const usuario = await this.usuarioRepo.findOne({ where: { id } });
  if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);

  usuario.activo = activo; // asigna directamente lo que viene
  return this.usuarioRepo.save(usuario); // guarda en DB y devuelve el usuario actualizado
}

  async cambiarContrasena(usuarioId: number, dto: ChangePasswordDto) {
  console.log('🚀 LLEGÓ AL SERVICE - cambiarContrasena');
  console.log('usuarioId:', usuarioId);
  console.log('DTO recibido:', dto);

  const { contrasena_actual, nueva_contrasena, confirmar_nueva_contrasena } = dto;

  console.log('contrasena_actual:', contrasena_actual);
  console.log('nueva_contrasena:', nueva_contrasena);
  console.log('confirmar_nueva_contrasena:', confirmar_nueva_contrasena);

  if (nueva_contrasena !== confirmar_nueva_contrasena) {
    console.log('❌ Las contraseñas no coinciden');
    throw new Error('Las nuevas contraseñas no coinciden');
  }

  console.log('🔍 Buscando usuario con ID:', usuarioId);
  const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
  
  if (!usuario) {
    console.log('❌ Usuario no encontrado');
    throw new NotFoundException('Usuario no encontrado');
  }

  console.log('✅ Usuario encontrado:', usuario.id, usuario.nombre_usuario);

  console.log('🔑 Comparando contraseña actual...');
  const esValida = await bcrypt.compare(contrasena_actual, usuario.contraseña_hash);
  
  if (!esValida) {
    console.log('❌ Contraseña actual incorrecta');
    throw new Error('La contraseña actual es incorrecta');
  }

  console.log('✅ Contraseña actual correcta');

  console.log('🔐 Hasheando nueva contraseña...');
  const salt = await bcrypt.genSalt(10);
  const nuevoHash = await bcrypt.hash(nueva_contrasena, salt);
  console.log('Nuevo hash generado');

  usuario.contraseña_hash = nuevoHash;
  console.log('💾 Guardando en DB...');

  await this.usuarioRepo.save(usuario);
  console.log('✅ Usuario guardado con nueva contraseña');

  return { mensaje: 'Contraseña actualizada exitosamente' };
}

  async remove(id: number): Promise<void> {
    const result = await this.usuarioRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
