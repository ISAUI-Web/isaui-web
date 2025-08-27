import { Controller, Post, Body } from '@nestjs/common';
import { MatriculaService } from './matricula.service';

@Controller('matricula')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Post('iniciar')
  async iniciarMatricula(@Body('dni') dni: string) {
    return this.matriculaService.validarAccesoMatricula(dni);
  }
}