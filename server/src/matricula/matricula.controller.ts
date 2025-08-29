import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MatriculaService } from './matricula.service';

@Controller('matricula')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Post('iniciar')
  async iniciarMatricula(@Body('dni') dni: string) {
    return this.matriculaService.validarAccesoMatricula(dni);
  }

  @Post('formalizar/:id')
async formalizar(@Param('id') id: number) {
  console.log('Controller: formalizar llamado con id', id);
  return this.matriculaService.formalizarMatricula(id);
}

  @Get()
  async findAll() {
    return this.matriculaService.findAll();
    
  }
}