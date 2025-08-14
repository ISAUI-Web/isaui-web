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
      })),
    );
  }

  async findOne(id: number) {
    const aspirante = await this.aspiranteRepository.findOne({
      where: { id },
      relations: ['preinscripciones', 'preinscripciones.carrera'],
    });

    if (!aspirante) throw new NotFoundException('Aspirante no encontrado');

    return aspirante;
  }

async update(
  id: number,
  updateAspiranteDto: UpdateAspiranteDto,
): Promise<Aspirante> {
  const aspirante = await this.aspiranteRepository.findOne({ where: { id } });

  if (!aspirante) {
    throw new NotFoundException(`No se encontró el aspirante con ID ${id}`);
  }

  const estadoAnterior = aspirante.estado_preinscripcion; // Guardamos el estado anterior

  const updated = this.aspiranteRepository.merge(
    aspirante,
    updateAspiranteDto,
  );
  const saved = await this.aspiranteRepository.save(updated);

  // Enviar email solo si el estado cambió
  if (
    updateAspiranteDto.estado_preinscripcion &&
    updateAspiranteDto.estado_preinscripcion !== estadoAnterior &&
    saved.email
  ) {
    try {
      await this.constanciaService.enviarNotificacionEstado(
        saved.email,
        `${saved.nombre} ${saved.apellido}`,
        saved.estado_preinscripcion
      );
    } catch (error) {
      console.error('Error al enviar email de cambio de estado:', error);
    }
  }

  return saved;
}
}