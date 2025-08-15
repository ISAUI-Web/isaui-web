import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { Carrera } from './carrera.entity';

@Controller('carrera')
export class CarreraController {
  constructor(private readonly carreraService: CarreraService) {}

  @Get()
  async findAll(): Promise<Carrera[]> {
    return this.carreraService.findAll();
  }

  @Post()
  async create(
    @Body('nombre') nombre: string,
    @Body('cupo_maximo', ParseIntPipe) cupo_maximo: number,
    @Body('cupo_actual', ParseIntPipe) cupo_actual: number,
  ): Promise<Carrera> {
    return this.carreraService.create({ nombre, cupo_maximo, cupo_actual });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body('nombre') nombre: string,
    @Body('cupo_maximo', ParseIntPipe) cupo_maximo: number,
    @Body('cupo_actual', ParseIntPipe) cupo_actual: number,
  ): Promise<Carrera> {
    return this.carreraService.update(id, { nombre, cupo_maximo, cupo_actual });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.carreraService.remove(id);
  }
}