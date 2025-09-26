import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get()
  async findAll() {
    return this.estudianteService.findAll();
  }

  @Get('by-aspirante/:aspiranteId')
  async findByAspiranteId(
    @Param('aspiranteId', ParseIntPipe) aspiranteId: number,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.estudianteService.findByAspiranteId(aspiranteId);
  }
}
