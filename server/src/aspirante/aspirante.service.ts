import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aspirante } from './aspirante.entity';
import { CreateAspiranteDto } from './dto/create-aspirante.dto';
import { UpdateAspiranteDto } from './dto/update-aspirante.dto';
import { DocumentoService } from '../documento/documento.service';
import { PreinscripcionService } from '../preinscripcion/preinscripcion.service';
import { ConstanciaService } from '../constancia/constancia.service';

@Injectable()
export class AspiranteService {
  constructor(
    @InjectRepository(Aspirante)
    private readonly aspiranteRepository: Repository<Aspirante>,
    private readonly documentoService: DocumentoService,
    private readonly preinscripcionService: PreinscripcionService,
    private readonly constanciaService: ConstanciaService,
  ) {}

  async create(
    dto: CreateAspiranteDto,
    archivos?: {
      dniFrente?: Express.Multer.File[];
      dniDorso?: Express.Multer.File[];
    },
  ): Promise<Aspirante> {
    // Crear y guardar el aspirante
    const aspirante = this.aspiranteRepository.create(dto);
    const savedAspirante = await this.aspiranteRepository.save(aspirante);

    // Si hay archivos, guardar documentos asociados
    if (archivos) {
      await this.documentoService.guardarDocumentosAspirante(
        savedAspirante,
        archivos,
      );
    }

    await this.preinscripcionService.create({
      aspirante_id: savedAspirante.id,
      carrera_id: dto.carrera_id,
    });

    return savedAspirante;
  }

  async findAll() {
    const aspirantes = await this.aspiranteRepository.find({
      select: ['id', 'nombre', 'apellido', 'dni'],
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
      relations: ['preinscripciones', 'preinscripciones.carrera'],
    });

    if (!aspirante) throw new NotFoundException('Aspirante no encontrado');

    // Traer documentos
    const documentos =
      await this.documentoService.getDocumentosByAspiranteId(id);

    // Crear objeto con URLs
    const aspiranteConDocumentos = {
      ...aspirante,
      dniFrenteUrl: documentos.dniFrente?.url || null,
      dniDorsoUrl: documentos.dniDorso?.url || null,
      dniFrenteNombre:
        documentos.dniFrente?.url.split('/').pop() ||
        'No hay imagen disponible',
      dniDorsoNombre:
        documentos.dniDorso?.url.split('/').pop() || 'No hay imagen disponible',
    };

    return aspiranteConDocumentos;
  }

  async update(
    id: number,
    updateAspiranteDto: UpdateAspiranteDto,
    archivos?: {
      dniFrente?: Express.Multer.File[];
      dniDorso?: Express.Multer.File[];
    },
  ): Promise<Aspirante> {
    // Se carga la relación con preinscripciones para asegurar que leemos el estado correcto.
    const aspirante = await this.aspiranteRepository.findOne({
      where: { id },
      relations: ['preinscripciones'],
    });

    if (!aspirante) {
      throw new NotFoundException(`No se encontró el aspirante con ID ${id}`);
    }

    // La fuente de verdad para el estado es la tabla de preinscripción.
    const estadoAnterior = aspirante.preinscripciones?.[0]?.estado;

    // Separamos el estado del resto de los datos para no guardarlo en la tabla de aspirantes.
    const { estado_preinscripcion, ...datosAspirante } = updateAspiranteDto;

    const updated = this.aspiranteRepository.merge(aspirante, datosAspirante);
    const saved = await this.aspiranteRepository.save(updated);

    // Si se subieron nuevos archivos, los guardamos.
    if (archivos && (archivos.dniFrente?.length || archivos.dniDorso?.length)) {
      await this.documentoService.guardarDocumentosAspirante(saved, archivos);
    }

    // Se actualiza el estado en la tabla 'preinscripcion' si ha cambiado.
    if (estado_preinscripcion && estado_preinscripcion !== estadoAnterior) {
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
          );
        } catch (error) {
          console.error('Error al enviar email de cambio de estado:', error);
        }
      }
    }

    return saved;
  }
}
