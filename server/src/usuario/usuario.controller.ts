import { Controller, Post, Body, Get, Put, Param, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './usuario.entity';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // 🔑 LOGIN
  @Post('login')
  async login(@Body() loginDto: LoginUsuarioDto) {
    return this.usuarioService.validarUsuario(
      loginDto.nombre_usuario,
      loginDto.contraseña,
    );
  }

  // 📌 CRUD
  @Get()
  async findAll(): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Usuario> {
    return this.usuarioService.findOne(id);
  }

  @Post()
  async create(@Body() data: CreateUsuarioDto): Promise<Usuario> {
    return this.usuarioService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: UpdateUsuarioDto,
  ): Promise<Usuario> {
    return this.usuarioService.update(id, data);
  }

  @Put(':id/reset-password')
  async resetPassword(@Param('id') id: number) {
    return this.usuarioService.resetPassword(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usuarioService.remove(id);
  }
}
