import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';
import { Matricula } from './matricula.entity';

@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(Aspirante)
    private aspiranteRepository: Repository<Aspirante>,
    @InjectRepository(Preinscripcion)
    private preinscripcionRepository: Repository<Preinscripcion>,
    @InjectRepository(Matricula)
    private matriculaRepository: Repository<Matricula>,
  ) {}

  async validarAccesoMatricula(dni: string) {
    // Buscar aspirante por DNI
    const aspirante = await this.aspiranteRepository.findOne({
      where: { dni },
    });

    if (!aspirante) {
      return { ok: false, reason: 'No existe un aspirante con ese DNI.' };
    }

    // Buscar preinscripción confirmada
    const preinscripcionConfirmada =
      await this.preinscripcionRepository.findOne({
        where: {
          aspirante_id: aspirante.id,
          estado: 'Confirmado',
        },
      });

    if (!preinscripcionConfirmada) {
      return { ok: false, reason: 'La preinscripción no está confirmada.' };
    }

    // Todo ok, puede iniciar la matrícula
    return {
      ok: true,
      aspirante: {
        id: aspirante.id,
        nombre: aspirante.nombre,
        apellido: aspirante.apellido,
        dni: aspirante.dni,
        email: aspirante.email,
      },
    };
  }

  async formalizarMatricula(aspiranteId: number): Promise<Matricula> {
    // 1. Verificar si ya existe una matrícula para este aspirante
    const matriculaExistente = await this.matriculaRepository.findOne({
      where: { aspirante: { id: aspiranteId } },
    });

    if (matriculaExistente) {
      // Si ya existe, simplemente la retornamos para evitar duplicados.
      return matriculaExistente;
    }

    // 2. Buscar al aspirante y su preinscripción para obtener la carrera
    const aspirante = await this.aspiranteRepository.findOne({
      where: { id: aspiranteId },
      relations: ['preinscripciones', 'preinscripciones.carrera'],
    });

    if (!aspirante) {
      throw new NotFoundException(
        `Aspirante con ID ${aspiranteId} no encontrado.`,
      );
    }

    const preinscripcion = aspirante.preinscripciones?.[0];
    if (!preinscripcion || !preinscripcion.carrera) {
      throw new NotFoundException(
        `No se encontró preinscripción o carrera asociada para el aspirante con ID ${aspiranteId}.`,
      );
    }

    // 3. Crear el nuevo registro de matrícula
    const nuevaMatricula = this.matriculaRepository.create({
      aspirante,
      carrera: preinscripcion.carrera,
      fecha_matricula: new Date(),
      estado: 'pendiente',
      constancia_pdf: '', // Campo ignorado
    });

    return this.matriculaRepository.save(nuevaMatricula);
  }
}
