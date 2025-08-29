import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';
import { Matricula } from './matricula.entity';
import { ConstanciaService } from '../constancia/constancia.service';

@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(Aspirante)
    private aspiranteRepository: Repository<Aspirante>,
    @InjectRepository(Preinscripcion)
    private preinscripcionRepository: Repository<Preinscripcion>,
    @InjectRepository(Matricula)
    private matriculaRepository: Repository<Matricula>,
    private readonly constanciaService: ConstanciaService,
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
  // Verificar si ya existe una matrícula
  const matriculaExistente = await this.matriculaRepository.findOne({
    where: { aspirante: { id: aspiranteId } },
  });
  if (matriculaExistente) return matriculaExistente;

  // Buscar aspirante y preinscripción
  const aspirante = await this.aspiranteRepository.findOne({
    where: { id: aspiranteId },
    relations: ['preinscripciones', 'preinscripciones.carrera'],
  });
  if (!aspirante) throw new NotFoundException(`Aspirante no encontrado`);

  const preinscripcion = aspirante.preinscripciones?.[0];
  if (!preinscripcion || !preinscripcion.carrera) {
    throw new NotFoundException(`Preinscripción o carrera no encontrada`);
  }

  // Crear nueva matrícula
  const nuevaMatricula = this.matriculaRepository.create({
    aspirante,
    carrera: preinscripcion.carrera,
    fecha_matricula: new Date(),
    estado: 'pendiente',
    constancia_pdf: '', // puedes guardar el nombre si querés
  });

  const savedMatricula = await this.matriculaRepository.save(nuevaMatricula);
  console.log('Matricula creada', nuevaMatricula);
  // --- GENERAR Y ENVIAR PDF ---
  try {
    console.log('Intento de enviar PDF');
    const data = {
      nombre: aspirante.nombre,
      apellido: aspirante.apellido,
      dni: aspirante.dni,
      email: aspirante.email,
      numeroRegistro: String(aspirante.id),
      fechaPreinscripcion: new Date(preinscripcion.fecha_preinscripcion).toISOString().split('T')[0],
      fechaMatriculacion: new Date(savedMatricula.fecha_matricula).toISOString().split('T')[0],
    };

    const pdf = await this.constanciaService.generarPDFMatriculacion(data);
    await this.constanciaService.enviarEmailConPDFMatriculacion(pdf, aspirante.email);
  } catch (error) {
    console.error('Error enviando constancia PDF:', error);
  }
  console.log('Fin');
  return savedMatricula;
}

  async findAll(): Promise<Matricula[]> {
    return this.matriculaRepository.find({
      relations: ['aspirante', 'carrera'],
    });
  }

  async updateEstadoForAspirante(aspiranteId: number, estado: string) {
    const matricula = await this.matriculaRepository.findOne({
      where: { aspirante: { id: aspiranteId } },
      relations: ['aspirante'], // Cargar la relación para obtener datos del aspirante
    });

    if (!matricula) {
      throw new NotFoundException(
        `No se encontró matrícula para el aspirante con ID ${aspiranteId}`,
      );
    }

    const estadoAnterior = matricula.estado;

    if (estado && estado !== estadoAnterior) {
      matricula.estado = estado;
      await this.matriculaRepository.save(matricula);

      const aspirante = matricula.aspirante;
      if (aspirante && aspirante.email) {
        try {
          await this.constanciaService.enviarNotificacionEstado(
            aspirante.email,
            `${aspirante.nombre} ${aspirante.apellido}`,
            estado,
            'matriculación',
          );
        } catch (error) {
          console.error(
            'Error al enviar email de cambio de estado de matriculación:',
            error,
          );
        }
      }
    }
    return matricula;
  }
}
