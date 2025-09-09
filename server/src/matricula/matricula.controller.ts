import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
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

  @Put(':aspiranteId/estado')
async updateEstado(
  @Param('aspiranteId', ParseIntPipe) aspiranteId: number,
  @Body('estado') estado: string,
) {
  // Validar que el estado sea uno de los permitidos
  const estadosPermitidos = ['pendiente', 'en espera', 'confirmado', 'rechazado'] as const;
  if (!estadosPermitidos.includes(estado as any)) {
    throw new BadRequestException('Estado inválido');
  }

  // Llamar al servicio con tipo seguro
  return this.matriculaService.updateEstadoForAspirante(
    aspiranteId,
    estado as 'pendiente' | 'en espera' | 'confirmado' | 'rechazado'
  );
}
}
