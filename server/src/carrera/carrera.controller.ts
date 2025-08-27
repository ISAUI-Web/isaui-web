import { Controller, Get, Patch, Post, Put, Delete, Param, Body, ParseIntPipe, BadRequestException, NotFoundException } from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { Carrera } from './carrera.entity';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';

@Controller('carrera')
export class CarreraController {
  constructor(private readonly carreraService: CarreraService) {}
  
  @Get()
  async findAll(): Promise<Carrera[]> {
    return this.carreraService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Carrera> {
    const carrera = await this.carreraService.findOne(id);
    if (!carrera) throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    return carrera;
}

  @Post()
  async create(@Body() data: CreateCarreraDto): Promise<Carrera> {
    return this.carreraService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCarreraDto,
  ): Promise<Carrera> {
    return this.carreraService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.carreraService.remove(id);
  }

  @Patch(':id')
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCarreraDto,
  ): Promise<Carrera> {
    // Llama al mismo update del servicio, que ya acepta campos parciales
    return this.carreraService.update(id, data);
}
}
