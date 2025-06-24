import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as nodemailer from 'nodemailer';

interface AspiranteData {
  nombre: string;
  apellido: string;
  dni: string;
  carrera: string;
  fechaPreinscripcion: string;
  numeroRegistro: string;
  email: string;
}

@Injectable()
export class ConstanciaService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true para puerto 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async generarPDF(data: AspiranteData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Uint8Array[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Título
        doc.fontSize(20).text('Constancia de Preinscripción', { align: 'center' });
        doc.moveDown();

        // Datos aspirante
        doc.fontSize(12);
        doc.text(`Nombre: ${data.nombre} ${data.apellido}`);
        doc.text(`DNI: ${data.dni}`);
        doc.text(`Carrera seleccionada: ${data.carrera}`);
        doc.text(`Fecha de Preinscripción: ${data.fechaPreinscripcion}`);
        doc.text(`Número de Registro: ${data.numeroRegistro}`);

        doc.moveDown();
        doc.text(
          'Esta constancia certifica que el aspirante ha completado correctamente el proceso de preinscripción.',
          { align: 'justify' },
        );

        // Pie de página
        doc.moveDown();
        doc.text('Instituto Superior Arturo Umberto Illia', { align: 'center', italic: true });

        doc.end();
      } catch (error) {
        reject(error);
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
    } catch (error) {
      throw new InternalServerErrorException('Error enviando el email: ' + error.message);
    }
  }
}

