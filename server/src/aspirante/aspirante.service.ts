import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { Aspirante } from './aspirante.entity';
import { CreateAspiranteDto } from './dto/create-aspirante.dto';
import { UpdateAspiranteDto } from './dto/update-aspirante.dto';
import { DocumentoService } from '../documento/documento.service';
import { PreinscripcionService } from '../preinscripcion/preinscripcion.service';
import { ConstanciaService } from '../constancia/constancia.service';
import { MatriculaService } from '../matricula/matricula.service';
import PDFDocument from 'pdfkit';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';
import { Matricula } from '../matricula/matricula.entity';
import { Carrera } from '../carrera/carrera.entity';
import { EstudianteService } from '../estudiante/estudiante.service';
import { Estudiante } from '../estudiante/estudiante.entity';

@Injectable()
export class AspiranteService {
  constructor(
    @InjectRepository(Aspirante)
    private readonly aspiranteRepository: Repository<Aspirante>,
    private readonly documentoService: DocumentoService,
    private readonly preinscripcionService: PreinscripcionService,
    private readonly constanciaService: ConstanciaService,
    private readonly matriculaService: MatriculaService,
    private readonly estudianteService: EstudianteService,
    @InjectRepository(Preinscripcion)
    private readonly preinscripcionRepository: Repository<Preinscripcion>,
    @InjectRepository(Carrera)
    private readonly carreraRepository: Repository<Carrera>,
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
  ) {}

  async create(
    createAspiranteDto: CreateAspiranteDto,
    files: { [fieldname: string]: Express.Multer.File[] } = {},
    queryRunner?: QueryRunner,
  ): Promise<Aspirante> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.aspiranteRepository.manager;

    const carrera = await manager.findOneBy(Carrera, { id: createAspiranteDto.carrera_id });
    if (!carrera) throw new NotFoundException('Carrera no encontrada');

    const nuevoAspirante = manager.create(Aspirante, {
      ...createAspiranteDto,
    });

    const aspiranteGuardado = await manager.save(nuevoAspirante);

    const preinscripcion = manager.create(Preinscripcion, {
      aspirante: aspiranteGuardado,
      carrera: carrera,
      fecha_preinscripcion: new Date(),
      estado: 'pendiente',
    });

    await manager.save(preinscripcion);

    // El método de documentos también debe aceptar el queryRunner
    // Corregimos el nombre del método y pasamos el objeto aspirante completo
    await this.documentoService.guardarDocumentosAspirante(
      aspiranteGuardado,
      files,
      queryRunner,
    );

    return aspiranteGuardado;
  }

  async findAll() {
    const aspirantes = await this.aspiranteRepository.find({
      select: ['id', 'nombre', 'apellido', 'dni'],
      where: {
        origen: 'PREINSCRIPCION_WEB',
      },
      relations: ['preinscripciones', 'preinscripciones.carrera'],
    });

    return aspirantes.flatMap((aspirante) =>
      aspirante.preinscripciones.map((pre) => ({
        id: aspirante.id, // Necesario para abrir el detalleAsp
        nombre: aspirante.nombre,
        apellido: aspirante.apellido,
        dni: aspirante.dni,
        carrera: pre.carrera?.nombre || 'Sin carrera',
        estado_preinscripcion: pre.estado || 'Sin estado',
      })),
    );
  }

  async findOne(id: number) {
    const aspirante = await this.aspiranteRepository.findOne({
      where: { id },
      relations: ['preinscripciones', 'preinscripciones.carrera', 'matriculas'],
    });

    if (!aspirante) throw new NotFoundException('Aspirante no encontrado');

    // Traer todos los documentos usando el servicio centralizado
    const documentos =
      await this.documentoService.getDocumentosByAspiranteId(id);

    const aspiranteConDocumentos = {
      ...aspirante,
      ...documentos,
    };

    return aspiranteConDocumentos;
  }

  async update(
    id: number,
    updateAspiranteDto: UpdateAspiranteDto,
    archivos?: { [fieldname: string]: Express.Multer.File[] },
  ): Promise<any> {
    // Se carga la relación con preinscripciones para asegurar que leemos el estado correcto.
    const aspirante = await this.aspiranteRepository.findOne({
      where: { id },
      relations: ['preinscripciones', 'matriculas'],
    });

    if (!aspirante) {
      throw new NotFoundException(`No se encontró el aspirante con ID ${id}`);
    }

    const estadoPreinscripcionAnterior =
      aspirante.preinscripciones?.[0]?.estado;
    const matricula = aspirante.matriculas?.[0];
    const estadoMatriculacionAnterior = matricula?.estado;

    // Separamos los estados del resto de los datos para no guardarlos en la tabla de aspirantes.
    const {
      estado_preinscripcion,
      estado_matriculacion,
      ciclo_lectivo, // Extraemos el ciclo lectivo para manejarlo por separado
      ...datosAspirante
    } = updateAspiranteDto;

    const updated = this.aspiranteRepository.merge(aspirante, datosAspirante);
    const saved = await this.aspiranteRepository.save(updated);

    // Si se subieron nuevos archivos, los guardamos.
    if (archivos && Object.keys(archivos).length > 0) {
      await this.documentoService.guardarDocumentosAspirante(saved, archivos);
    }

    // Si se proporcionó un ciclo_lectivo, actualizamos la entidad Estudiante.
    if (ciclo_lectivo) {
      const estudiante = await this.estudianteRepository.findOneBy({
        aspirante: { id: id },
      });
      if (estudiante) {
        await this.estudianteRepository.update(estudiante.id, { ciclo_lectivo });
      }
    }

    // Se actualiza el estado en la tabla 'preinscripcion' si ha cambiado.
    if (
      estado_preinscripcion &&
      estado_preinscripcion !== estadoPreinscripcionAnterior
    ) {
      await this.preinscripcionService.updateEstadoForAspirante(
        id,
        estado_preinscripcion,
      );

      if (saved.email) {
        try {
          await this.constanciaService.enviarNotificacionEstado(
            saved.email,
            `${saved.nombre} ${saved.apellido}`,
            estado_preinscripcion,
            'preinscripción',
          );
        } catch (error) {
          console.error(
            'Error al enviar email de cambio de estado de preinscripción:',
            error,
          );
        }
      }
    }

    // Se actualiza el estado en la tabla 'matricula' si ha cambiado y si existe una matrícula.
    if (
      matricula &&
      estado_matriculacion &&
      estado_matriculacion !== estadoMatriculacionAnterior
    ) {
      const estadosPermitidos = [
        'pendiente',
        'en espera',
        'confirmado',
        'rechazado',
      ] as const;

      if (!estadosPermitidos.includes(estado_matriculacion as any)) {
        throw new BadRequestException('Estado de matrícula inválido');
      }

      // La clave es que updateEstadoForAspirante ya maneja la transacción internamente.
      // No necesitamos el queryRunner aquí.
      // Y no necesitamos hacer nada con su valor de retorno, porque al final
      // construiremos la respuesta de forma unificada.
      await this.matriculaService.updateEstadoForAspirante(
        id,
        estado_matriculacion as
          | 'pendiente'
          | 'en espera'
          | 'confirmado'
          | 'rechazado',
        (updateAspiranteDto as any).ciclo_lectivo || new Date().getFullYear(),
      );
    }

    // Devolvemos el legajo completo del estudiante, que ya contiene los datos actualizados.
    // Esto asegura que el frontend reciba el ciclo_lectivo correcto.
    try {
      const legajoCompleto = await this.estudianteService.findByAspiranteId(id);
      return legajoCompleto;
    } catch (error) {
      // Si findByAspiranteId lanza NotFoundException (porque el aspirante no es estudiante),
      // lo capturamos y construimos una respuesta consistente.
      if (error instanceof NotFoundException) {
        // Volvemos a buscar el aspirante para obtener todos los datos actualizados,
        // incluyendo los documentos y relaciones, y lo devolvemos con la estructura esperada.
        const aspiranteActualizado = await this.findOne(id);
        const preinscripcion = aspiranteActualizado.preinscripciones?.[0];
        const matricula = aspiranteActualizado.matriculas?.[0];

        return {
          ...aspiranteActualizado, // Mantenemos los datos del aspirante
          ciclo_lectivo: updateAspiranteDto.ciclo_lectivo, // Devolvemos el ciclo lectivo actualizado
          estado_preinscripcion: preinscripcion?.estado || 'N/A',
          estado_matriculacion: matricula?.estado || 'no matriculado',
        };
      }
      // Si es otro tipo de error, lo relanzamos para que no se oculte.
      throw error;
    }
  }

  private async getPreinscripcionesForReport(
    carreraId?: number,
    estado?: string,
  ): Promise<Preinscripcion[]> {
    const where: FindOptionsWhere<Preinscripcion> = {};

    if (carreraId) {
      where.carrera = { id: carreraId };
    }
    if (estado && estado !== 'todos') {
      where.estado = estado;
    }

    // Asumimos que preinscripcionService tiene un método find que acepta opciones de TypeORM.
    return this.preinscripcionService.find({
      where,
      relations: ['aspirante', 'carrera'],
    });
  }

  async generatePreinscriptosPdf(
    carreraId?: number,
    estado?: string,
  ): Promise<Buffer> {
    const preinscripciones = await this.getPreinscripcionesForReport(
      carreraId,
      estado,
    );

    const reportData = new Map<string, Preinscripcion[]>();

    for (const pre of preinscripciones) {
      if (pre.carrera && pre.aspirante) {
        const carreraNombre = pre.carrera.nombre;
        if (!reportData.has(carreraNombre)) {
          reportData.set(carreraNombre, []);
        }
        reportData.get(carreraNombre)!.push(pre);
      }
    }

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        margin: 50,
      });

      doc
        .fontSize(20)
        .text('Reporte de Aspirantes Preinscriptos', { align: 'center' });
      doc.moveDown();

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

      if (reportData.size === 0) {
        doc
          .fontSize(12)
          .text(
            'No se encontraron aspirantes que coincidan con los filtros seleccionados.',
            { align: 'center' },
          );
      } else {
        reportData.forEach((preinscripcionesDeCarrera, carreraNombre) => {
          doc.x = 50;
          doc
            .fontSize(16)
            .text(carreraNombre, { underline: true, align: 'left' });
          doc.moveDown(0.5);

          if (estado && estado !== 'todos') {
            const total = preinscripcionesDeCarrera.length;
            doc
              .fontSize(12)
              .text(
                `Total de aspirantes en estado "${
                  estado.charAt(0).toUpperCase() + estado.slice(1)
                }": ${total}`,
              );
            doc.moveDown();
          } else {
            const stats = {
              pendiente: 0,
              confirmado: 0,
              'en espera': 0,
              rechazado: 0,
            };
            preinscripcionesDeCarrera.forEach((pre) => {
              if (Object.prototype.hasOwnProperty.call(stats, pre.estado)) {
                stats[pre.estado]++;
              }
            });
            const totalGeneral = preinscripcionesDeCarrera.length;

            doc
              .fontSize(12)
              .text(`Total general de aspirantes: ${totalGeneral}`);
            doc.moveDown(2);
            doc
              .font('Helvetica-Bold')
              .fontSize(10)
              .text('Desglose por estado:');
            doc
              .font('Helvetica')
              .fontSize(10)
              .list(
                [
                  `Pendientes: ${stats.pendiente}`,
                  `Confirmados: ${stats.confirmado}`,
                  `En Espera: ${stats['en espera']}`,
                  `Rechazados: ${stats.rechazado}`,
                ],
                { bulletRadius: 2, textIndent: 10, bulletIndent: 5 },
              );
            doc.moveDown(2);
          }

          const tableTop = doc.y;
          const apellidoX = 50;
          const nombreX = 180;
          const dniX = 310;
          const carreraColX = 400;

          doc.font('Helvetica-Bold').fontSize(10);
          doc.text('Apellido', apellidoX, tableTop);
          doc.text('Nombre', nombreX, tableTop);
          doc.text('DNI', dniX, tableTop);
          doc.text('Carrera', carreraColX, tableTop);
          doc.moveDown(0.5);
          const lineY = doc.y;
          doc
            .moveTo(apellidoX, lineY)
            .lineTo(doc.page.width - 50, lineY)
            .stroke();
          doc.moveDown(0.5);

          doc.font('Helvetica').fontSize(10);

          preinscripcionesDeCarrera.forEach((pre) => {
            const aspirante = pre.aspirante;
            const rowY = doc.y;
            if (rowY > doc.page.height - 50) doc.addPage();
            doc.text(aspirante.apellido, apellidoX, rowY, { width: 120 });
            doc.text(aspirante.nombre, nombreX, rowY, { width: 120 });
            doc.text(aspirante.dni, dniX, rowY, { width: 80 });
            doc.text(pre.carrera.nombre, carreraColX, rowY, { width: 150 });
            doc.moveDown(1.5);
          });
          doc.moveDown(2);
        });
      }

      doc.end();
      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffer)));
    });

    return pdfBuffer;
  }

  private async getMatriculacionesForReport(
    carreraId?: number,
    estado?: string,
  ): Promise<Matricula[]> {
    const where: FindOptionsWhere<Matricula> = {};

    if (carreraId) {
      where.carrera = { id: carreraId };
    }
    if (estado && estado !== 'todos') {
      where.estado = estado;
    }

    // Asumimos que matriculaService tiene un método find que acepta opciones de TypeORM.
    return this.matriculaService.find({
      where,
      relations: ['aspirante', 'carrera'],
    });
  }

  async generateMatriculadosPdf(
    carreraId?: number,
    estado?: string,
  ): Promise<Buffer> {
    const matriculaciones = await this.getMatriculacionesForReport(
      carreraId,
      estado,
    );

    const reportData = new Map<string, Matricula[]>();

    for (const mat of matriculaciones) {
      if (mat.carrera && mat.aspirante) {
        const carreraNombre = mat.carrera.nombre;
        if (!reportData.has(carreraNombre)) {
          reportData.set(carreraNombre, []);
        }
        reportData.get(carreraNombre)!.push(mat);
      }
    }

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        margin: 50,
      });

      doc
        .fontSize(20)
        .text('Reporte de Aspirantes Matriculados', { align: 'center' });
      doc.moveDown();

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

      if (reportData.size === 0) {
        doc
          .fontSize(12)
          .text(
            'No se encontraron aspirantes matriculados que coincidan con los filtros seleccionados.',
            { align: 'center' },
          );
      } else {
        reportData.forEach((matriculacionesDeCarrera, carreraNombre) => {
          doc.x = 50;
          doc
            .fontSize(16)
            .text(carreraNombre, { underline: true, align: 'left' });
          doc.moveDown(0.5);

          if (estado && estado !== 'todos') {
            const total = matriculacionesDeCarrera.length;
            doc
              .fontSize(12)
              .text(
                `Total de aspirantes matriculados en estado "${
                  estado.charAt(0).toUpperCase() + estado.slice(1)
                }": ${total}`,
              );
            doc.moveDown();
          } else {
            const stats = {
              pendiente: 0,
              confirmado: 0,
              'en espera': 0,
              rechazado: 0,
            };
            matriculacionesDeCarrera.forEach((mat) => {
              if (Object.prototype.hasOwnProperty.call(stats, mat.estado)) {
                stats[mat.estado]++;
              }
            });
            const totalGeneral = matriculacionesDeCarrera.length;

            doc
              .fontSize(12)
              .text(
                `Total general de aspirantes matriculados: ${totalGeneral}`,
              );
            doc.moveDown(2);
            doc
              .font('Helvetica-Bold')
              .fontSize(10)
              .text('Desglose por estado:');
            doc
              .font('Helvetica')
              .fontSize(10)
              .list(
                [
                  `Pendientes: ${stats.pendiente}`,
                  `Confirmados: ${stats.confirmado}`,
                  `En Espera: ${stats['en espera']}`,
                  `Rechazados: ${stats.rechazado}`,
                ],
                { bulletRadius: 2, textIndent: 10, bulletIndent: 5 },
              );
            doc.moveDown(2);
          }

          const tableTop = doc.y;
          const apellidoX = 50,
            nombreX = 180,
            dniX = 310,
            carreraColX = 400;

          doc.font('Helvetica-Bold').fontSize(10);
          doc
            .text('Apellido', apellidoX, tableTop)
            .text('Nombre', nombreX, tableTop)
            .text('DNI', dniX, tableTop)
            .text('Carrera', carreraColX, tableTop);
          doc.moveDown(0.5);
          const lineY = doc.y;
          doc
            .moveTo(apellidoX, lineY)
            .lineTo(doc.page.width - 50, lineY)
            .stroke();
          doc.moveDown(0.5);

          doc.font('Helvetica').fontSize(10);
          matriculacionesDeCarrera.forEach((mat) => {
            const aspirante = mat.aspirante;
            const rowY = doc.y;
            if (rowY > doc.page.height - 50) doc.addPage();
            doc
              .text(aspirante.apellido, apellidoX, rowY, { width: 120 })
              .text(aspirante.nombre, nombreX, rowY, { width: 120 })
              .text(aspirante.dni, dniX, rowY, { width: 80 })
              .text(mat.carrera.nombre, carreraColX, rowY, { width: 150 });
            doc.moveDown(1.5);
          });
          doc.moveDown(2);
        });
      }

      doc.end();
      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffer)));
    });

    return pdfBuffer;
  }
}
