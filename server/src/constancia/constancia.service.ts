import { Injectable, InternalServerErrorException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aspirante } from '../aspirante/aspirante.entity'; // Ajustá la ruta según tu estructura

interface AspiranteData {
  nombre: string;
  apellido: string;
  dni: string;
  fechaPreinscripcion: string;
  numeroRegistro: string;
  email: string;
}

@Injectable()
export class ConstanciaService {
  private transporter: Transporter;

  constructor(
    @InjectRepository(Aspirante)
    private aspiranteRepository: Repository<Aspirante>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async obtenerNumeroRegistroPorDNI(dni: string): Promise<number> {
    const aspirante = await this.aspiranteRepository.findOneBy({ dni });
    if (!aspirante)
      throw new InternalServerErrorException('Aspirante no encontrado');
    return aspirante.id;
  }

  async generarPDF(data: AspiranteData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Uint8Array[] = [];
      doc.on('data', (chunk: Uint8Array) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      try {
        doc.image('assets/logo.png', doc.page.width / 2 - 50, 40, {
          width: 100,
        });
        doc.moveDown(5);
        doc
          .fontSize(20)
          .text('Constancia de Preinscripción', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Nombre: ${data.nombre} ${data.apellido}`);
        doc.text(`DNI: ${data.dni}`);
        doc.text(`Número de Registro: ${data.numeroRegistro}`);
        doc.text(`Fecha de Preinscripción: ${data.fechaPreinscripcion}`);
        doc.moveDown();
        doc.text(
          'Su formulario de preinscripción ha sido enviado exitosamente. Nos pondremos en contacto con usted a la brevedad para brindarle más información.',
          { align: 'justify' },
        );
        doc.moveDown();
        doc
          .font('Helvetica-Oblique')
          .fontSize(20)
          .text('Instituto Superior Arturo Umberto Illia', {
            align: 'center',
          });
        doc.end();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async enviarEmailConPDF(pdfBuffer: Buffer, toEmail: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Instituto ISAUI" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Constancia de Preinscripción',
        text: 'Adjuntamos su constancia en PDF del proceso de preinscripción.',
        attachments: [
          {
            filename: 'constancia_preinscripcion.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('Error: ' + error.message);
      } else {
        throw new InternalServerErrorException('Error desconocido');
      }
    }
  }
}
