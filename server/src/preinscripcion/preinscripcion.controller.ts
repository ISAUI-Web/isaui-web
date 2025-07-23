import { Controller, Post, Body } from '@nestjs/common';
import { PreinscripcionService } from './preinscripcion.service';
import { CreatePreinscripcionDto } from './dto/create-preinscripcion.dto';

@Controller('preinscripcion')
export class PreinscripcionController {
  constructor(private readonly preinscripcionService: PreinscripcionService) {}

  @Post()
  async create(@Body() createPreinscripcionDto: CreatePreinscripcionDto) {
    return this.preinscripcionService.create(createPreinscripcionDto);
  }
}
