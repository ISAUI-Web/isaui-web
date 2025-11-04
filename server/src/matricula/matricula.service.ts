import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  QueryRunner,
  FindManyOptions,
  Repository,
  EntityManager,
} from 'typeorm';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';
import { Matricula } from './matricula.entity';
import { ConstanciaService } from '../constancia/constancia.service';
import { EstudianteService } from '../estudiante/estudiante.service';

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
    @Inject(forwardRef(() => EstudianteService))
    private estudianteService: EstudianteService,
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

  async formalizarMatricula(
    aspiranteId: number,
    queryRunner?: QueryRunner,
  ): Promise<Matricula> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.matriculaRepository.manager;

    // Verificar si ya existe una matrícula
    const matriculaExistente = await manager.findOne(Matricula, {
      where: { aspirante: { id: aspiranteId } },
    });
    if (matriculaExistente) return matriculaExistente;

    // Buscar aspirante y preinscripción
    const aspirante = await manager.findOne(Aspirante, {
      where: { id: aspiranteId },
      relations: ['preinscripciones', 'preinscripciones.carrera'],
    });
    if (!aspirante) throw new NotFoundException(`Aspirante no encontrado`);

    const preinscripcion = aspirante.preinscripciones?.[0];
    if (!preinscripcion || !preinscripcion.carrera) {
      throw new NotFoundException(`Preinscripción o carrera no encontrada`);
    }

    // Crear nueva matrícula
    const nuevaMatricula = manager.create(Matricula, {
      aspirante,
      carrera: preinscripcion.carrera,
      fecha_matricula: new Date(),
      estado: 'pendiente',
      constancia_pdf: '', // puedes guardar el nombre si querés
    });

    const savedMatricula = await manager.save(nuevaMatricula);
    // --- GENERAR Y ENVIAR PDF ---
    try {
      const data = {
        nombre: aspirante.nombre,
        apellido: aspirante.apellido,
        dni: aspirante.dni,
        email: aspirante.email,
        numeroRegistro: String(aspirante.id),
        fechaPreinscripcion: new Date(preinscripcion.fecha_preinscripcion)
          .toISOString()
          .split('T')[0],
        fechaMatriculacion: new Date(savedMatricula.fecha_matricula)
          .toISOString()
          .split('T')[0],
      };

      const pdf = await this.constanciaService.generarPDFMatriculacion(data);
      await this.constanciaService.enviarEmailConPDFMatriculacion(
        pdf,
        aspirante.email,
      );
    } catch (error) {
      // Es importante registrar este error de forma visible.
      // No lanzamos una excepción para no revertir la creación de la matrícula,
      // pero sí dejamos constancia del fallo en el envío del email.
      console.error('FALLO EN EL ENVÍO DE CONSTANCIA DE MATRICULACIÓN:', error);
    }
    return savedMatricula;
  }

  async findAll(): Promise<Matricula[]> {
    return this.matriculaRepository.find({
      relations: ['aspirante', 'carrera'],
      where: {
        aspirante: {
          origen: 'PREINSCRIPCION_WEB',
        },
      },
    });
  }

  async find(options: FindManyOptions<Matricula>): Promise<Matricula[]> {
    return this.matriculaRepository.find(options);
  }

  async updateEstadoForAspirante(
    aspiranteId: number,
    nuevoEstado: 'pendiente' | 'en espera' | 'confirmado' | 'rechazado',
    cicloLectivo: number,
    queryRunner?: QueryRunner,
  ) {
    const performUpdate = async (manager: EntityManager) => {
      const matricula = await manager.findOne(Matricula, {
        where: { aspirante: { id: aspiranteId } },
        relations: ['aspirante', 'carrera'],
      });

      if (!matricula) {
        throw new NotFoundException(
          `No se encontró matrícula para el aspirante con ID ${aspiranteId}`,
        );
      }

      const estadoAnterior = matricula.estado;
      const carrera = matricula.carrera;

      if (estadoAnterior !== nuevoEstado) {
        // Si se confirma la matrícula, se crea el registro de estudiante.
        // La lógica de cupos ya no se maneja aquí.
        if (nuevoEstado === 'confirmado' && estadoAnterior !== 'confirmado') {
          await this.estudianteService.crearEstudianteDesdeAspirante(
            matricula.aspirante,
            cicloLectivo,
            queryRunner,
          );
        }

        // Actualizar estado de la matrícula
        matricula.estado = nuevoEstado;
        await manager.save(matricula);

        // Notificación por email
        const aspirante = matricula.aspirante;
        if (aspirante && aspirante.email) {
          try {
            await this.constanciaService.enviarNotificacionEstado(
              aspirante.email,
              `${aspirante.nombre} ${aspirante.apellido}`,
              nuevoEstado,
              'matriculación',
            );
          } catch (error) {
            console.error(
              'Error al enviar email de cambio de estado de matriculación:',
              error,
            );
          }
        }

        return matricula;
      }
    };

    if (queryRunner) {
      // Si estamos en una transacción, usamos su manager
      return performUpdate(queryRunner.manager);
    } else {
      // Si no, creamos una transacción nueva como antes
      return this.matriculaRepository.manager.transaction(performUpdate);
    }
  }
}
