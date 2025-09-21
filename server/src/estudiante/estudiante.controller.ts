import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get('by-aspirante/:aspiranteId')
  async findByAspiranteId(
    @Param('aspiranteId', ParseIntPipe) aspiranteId: number,
  ) {
    return this.estudianteService.findByAspiranteId(aspiranteId);
  }
}
