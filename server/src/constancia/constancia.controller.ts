import { Controller, Post, Body, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ConstanciaService } from './constancia.service';
import { Response } from 'express';

interface AspiranteDto {
  nombre: string;
  apellido: string;
  dni: string;
  // carrera: string;
  fechaPreinscripcion: string;
  numeroRegistro: string;
  email: string;
}

@Controller('constancia')
export class ConstanciaController {
  constructor(private readonly constanciaService: ConstanciaService) {}

  @Post('generar')
  async generarYEnviarConstancia(
    @Body() aspirante: AspiranteDto,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.constanciaService.generarPDF(aspirante);
      await this.constanciaService.enviarEmailConPDF(pdfBuffer, aspirante.email);

      // También podés devolver el PDF directamente si querés:
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=constancia_${aspirante.dni}.pdf`,
      });
      res.end(pdfBuffer);

      // Pero aquí devolvemos solo mensaje de éxito
      // res.status(HttpStatus.OK).json({ message: 'Constancia generada y enviada correctamente' });
    } catch (error) {
      throw new HttpException(
        `Error al generar o enviar constancia: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
