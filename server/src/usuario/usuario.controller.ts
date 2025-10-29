import { Controller, Patch, Post, Body, Get, Put, Param, Delete, ParseIntPipe, NotFoundException, Res, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RolUsuario, Usuario } from './usuario.entity';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('usuario') // Todos los endpoints de este controlador estarán protegidos por defecto
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // 🔑 LOGIN
  @Post('login')
  async login(
    @Body() loginDto: LoginUsuarioDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.usuarioService.validarUsuario(
      loginDto.nombre_usuario,
      loginDto.contraseña,
    );
    res.cookie('access_token', data.token, { httpOnly: true, secure: true, sameSite: 'strict' });
    return data;
  }
  
  
  // 📌 CRUD
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN_GENERAL)
  @Get()
  async findAll(): Promise<Usuario[]> {
    return this.usuarioService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN_GENERAL)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    const usuario = await this.usuarioService.findOne(id);
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN_GENERAL)
  @Post()
  async create(@Body() data: CreateUsuarioDto): Promise<Usuario> {
    return this.usuarioService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN_GENERAL)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: UpdateUsuarioDto,
  ): Promise<Usuario> {
    return this.usuarioService.update(id, data);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN_GENERAL)
  @Put(':id/reset-password')
  async resetPassword(@Param('id') id: number) {
    return this.usuarioService.resetPassword(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN_GENERAL)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usuarioService.remove(id);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN_GENERAL)
  @Patch(':id/activo')
  async toggleActivo(
    @Param('id', ParseIntPipe) id: number,
    @Body('activo') activo: boolean,
  ): Promise<Usuario> {
    return this.usuarioService.updateActivo(id, activo);
  }
}
