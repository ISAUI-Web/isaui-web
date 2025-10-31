import { Controller, Patch, Post, Body, Get, Put, Param, Delete, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './usuario.entity';
import { Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/update-contraseña.dto';

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

  @Patch('me/cambiar-contraseña')
  @UseGuards(AuthGuard('jwt'))
  async cambiarContraseña(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ) {
    const usuarioId = req.user.sub; // ¡OJO! Es `sub`, no `id`
    return this.usuarioService.cambiarContraseña(usuarioId, dto);
  }
  
  // 📌 CRUD
  @Get()
  async findAll(): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    const usuario = await this.usuarioService.findOne(id);
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
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


  @Patch(':id/activo')
async toggleActivo(
  @Param('id', ParseIntPipe) id: number,
  @Body('activo') activo: boolean,
): Promise<Usuario> {
  return this.usuarioService.updateActivo(id, activo);
}
}
