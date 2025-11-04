import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  Res,
  Query,
} from '@nestjs/common';
import { CarreraService } from './carrera.service';
import { Carrera } from './carrera.entity';
import { CreateCarreraDto } from './dto/create-carrera.dto';
import { UpdateCarreraDto } from './dto/update-carrera.dto';
import { Response } from 'express';

@Controller('carrera')
export class CarreraController {
  constructor(private readonly carreraService: CarreraService) {}

  @Get('reportes/cupos')
  async generateCuposReport(
    @Res() res: Response,
    @Query('carreraId', new ParseIntPipe({ optional: true }))
    carreraId?: number,
  ) {
    const pdfBuffer = await this.carreraService.generateCuposPdf(carreraId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=reporte-cupos.pdf',
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get()
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<Carrera[]> {
    const shouldIncludeInactive = includeInactive === 'true';
    return this.carreraService.findAll(shouldIncludeInactive);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Carrera> {
    const carrera = await this.carreraService.findOne(id);
    if (!carrera)
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
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
