import { Controller, Post, Body, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ConstanciaService } from './constancia.service';
import { Response } from 'express';

interface AspiranteDto {
  nombre: string;
  apellido: string;
  dni: string;
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
    console.log('--- Nuevo pedido de generación y envío de constancia ---');
    console.log('Datos recibidos del aspirante:', aspirante);

    try {
      aspirante.numeroRegistro = aspirante.numeroRegistro || '12345';
      const pdfBuffer = await this.constanciaService.generarPDF(aspirante);
      console.log('PDF generado correctamente, tamaño:', pdfBuffer.length);

      await this.constanciaService.enviarEmailConPDF(pdfBuffer, aspirante.email);
      console.log('Email enviado correctamente a:', aspirante.email);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=constancia_${aspirante.dni}.pdf`,
      });
      res.end(pdfBuffer);
      console.log('Respuesta con PDF enviada al cliente');
    } catch (error) {
      console.error('Error al generar o enviar constancia:', error);
      throw new HttpException(
        `Error al generar o enviar constancia: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}