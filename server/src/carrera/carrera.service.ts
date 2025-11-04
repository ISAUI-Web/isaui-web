import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Carrera } from './carrera.entity';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';

@Injectable()
export class CarreraService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Carrera)
    private carreraRepository: Repository<Carrera>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCarreras();
  }

  async seedCarreras() {
    const carreras = [
      {
        nombre: 'Técnico Superior en Desarrollo de Software',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Técnico Superior en Diseño de Espacios',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Técnico Superior en Turismo y Hotelería',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Técnico Superior en Enfermería',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Guía Superior en Turismo',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Guía Superior en Trekking y de Montaña',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
    ];

    for (const carrera of carreras) {
      const existe = await this.carreraRepository.findOneBy({
        nombre: carrera.nombre,
      });
      if (!existe) {
        await this.carreraRepository.save(carrera);
      }
    }
  }

  async findAll(includeInactive = false): Promise<Carrera[]> {
    const whereClause: any = {};
    if (!includeInactive) {
      whereClause.activo = true;
    }
    return this.carreraRepository.find({ where: whereClause });
  }

  async findOne(id: number): Promise<Carrera | null> {
    return this.carreraRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Carrera>): Promise<Carrera> {
    // 🚫 Verificar duplicado
    const existente = await this.carreraRepository.findOne({
      where: { nombre: data.nombre },
    });
    if (existente) {
      throw new Error(`La carrera "${data.nombre}" ya existe`);
    }

    const nuevaCarrera = this.carreraRepository.create(data);
    return this.carreraRepository.save(nuevaCarrera);
  }

  async update(id: number, data: Partial<Carrera>): Promise<Carrera> {
    const carrera = await this.carreraRepository.findOne({ where: { id } });
    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }

    // 🚫 Validar nombre duplicado
    if (data.nombre) {
      const existente = await this.carreraRepository.findOne({
        where: { nombre: data.nombre },
      });
      if (existente && existente.id !== id) {
        throw new Error(
          `Ya existe otra carrera con el nombre "${data.nombre}"`,
        );
      }
    }

    // Lógica para ajustar el cupo actual si el cupo máximo cambia
    if (
      data.cupo_maximo !== undefined &&
      data.cupo_maximo !== carrera.cupo_maximo
    ) {
      const cuposOcupados = carrera.cupo_maximo - carrera.cupo_actual;
      const nuevoCupoMaximo = Number(data.cupo_maximo);

      if (nuevoCupoMaximo < cuposOcupados) {
        throw new BadRequestException(
          `El nuevo cupo máximo (${nuevoCupoMaximo}) no puede ser menor que la cantidad de cupos ya ocupados (${cuposOcupados}).`,
        );
      }

      // Recalcular el cupo actual basado en el nuevo máximo
      data.cupo_actual = nuevoCupoMaximo - cuposOcupados;
    }

    Object.assign(carrera, data);
    return this.carreraRepository.save(carrera);
  }

  async remove(id: number): Promise<void> {
    const result = await this.carreraRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }
  }

  private async getCarrerasForReport(carreraId?: number): Promise<Carrera[]> {
    if (carreraId) {
      const carrera = await this.carreraRepository.findOneBy({ id: carreraId });
      if (!carrera) {
        throw new NotFoundException(
          `Carrera con ID ${carreraId} no encontrada`,
        );
      }
      return [carrera];
    } else {
      return this.carreraRepository.find();
    }
  }

  async generateCuposPdf(carreraId?: number): Promise<Buffer> {
    const carreras = await this.getCarrerasForReport(carreraId);

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        margin: 50,
      });

      // Header
      doc.fontSize(20).text('Reporte de Cupos', { align: 'center' });
      doc.moveDown();

      // Fecha y hora de generación
      const now = new Date();
      const fecha = now.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const hora = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      doc
        .fontSize(10)
        .text(`Generado el ${fecha} a las ${hora} hs.`, { align: 'right' });
      doc.moveDown(2);

      // Content
      const pageBottom = doc.page.height - doc.page.margins.bottom;
      const sectionHeight = 80; // Altura estimada para cada sección de carrera

      carreras.forEach((carrera) => {
        // Si la sección no cabe, agregar una nueva página
        if (doc.y + sectionHeight > pageBottom) {
          doc.addPage();
        }

        const cuposOcupados = carrera.cupo_maximo - carrera.cupo_actual;
        doc.fontSize(16).text(carrera.nombre, { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Cupos Totales (Máximo): ${carrera.cupo_maximo}`);
        doc.fontSize(12).text(`Cupos Disponibles: ${carrera.cupo_actual}`);
        doc.fontSize(12).text(`Cupos Ocupados: ${cuposOcupados}`);
        doc.moveDown(2);
      });

      doc.end();

      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
    });

    return pdfBuffer;
  }
}
