import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { DocumentoService } from '../documento/documento.service';
import { Estudiante } from './estudiante.entity';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Matricula } from '../matricula/matricula.entity';
import { Documento } from '../documento/documento.entity';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudianteService {
  private readonly logger = new Logger(EstudianteService.name);

  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Matricula)
    private readonly matriculaRepository: Repository<Matricula>,
    // Inyectamos el servicio de documentos en lugar del repositorio
    @Inject(forwardRef(() => DocumentoService))
    private readonly documentoService: DocumentoService,
  ) {}

  async findAll(): Promise<any[]> {
    const estudiantes = await this.estudianteRepository.find({
      where: { activo: true }, // 👈 filtra solo los activos
      relations: {
        aspirante: {
          preinscripciones: {
            carrera: true,
          },
        },
      },
    });

    return estudiantes.map((estudiante) => {
      return {
        id: estudiante.id, // ID del estudiante para la URL
        aspirante_id: estudiante.aspirante.id, // ID del aspirante para la URL
        nombre: estudiante.aspirante.nombre,
        apellido: estudiante.aspirante.apellido,
        dni: estudiante.aspirante.dni,
        carrera:
          estudiante.aspirante.preinscripciones?.[0]?.carrera?.nombre || 'N/A',
      };
    });
  }

  async findByAspiranteId(aspiranteId: number): Promise<any> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { aspirante: { id: aspiranteId } },
      relations: {
        aspirante: {
          preinscripciones: {
            carrera: true,
          },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException(
        `No se encontró un estudiante para el aspirante con ID ${aspiranteId}`,
      );
    }

    const matricula = await this.matriculaRepository.findOne({
      where: { aspirante: { id: aspiranteId } },
    });

    const aspirante = estudiante.aspirante;
    const preinscripcion = aspirante.preinscripciones?.[0];
    const carreraNombre = preinscripcion?.carrera?.nombre || 'N/A';

    // Usamos el servicio centralizado para obtener las URLs de los documentos
    const documentosMapeados =
      await this.documentoService.getDocumentosByAspiranteId(aspiranteId);

    // Componemos un objeto aspirante que coincide con lo que el frontend espera
    const aspiranteData = {
      ...aspirante,
      carrera: carreraNombre,
      // Transformamos el booleano a un string que el frontend espera
      trabajo: aspirante.trabajo ? 'Sí' : 'No',
      personas_cargo: aspirante.personas_cargo ? 'Sí' : 'No',
      estado_preinscripcion: preinscripcion?.estado || 'N/A',
      estado_matriculacion: matricula?.estado || 'no matriculado',
      ...documentosMapeados,
    };

    // Devolvemos el objeto estudiante con los datos del aspirante anidados
    const response = {
      ...estudiante,
      aspirante: aspiranteData,
    };

    return response;
  }

  async crearEstudianteDesdeAspirante(
    aspirante: Aspirante,
    cicloLectivo: number,
    queryRunner?: QueryRunner,
  ): Promise<Estudiante> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.estudianteRepository.manager;

    const estudianteExistente = await manager.findOne(Estudiante, {
      where: { aspirante: { id: aspirante.id } },
    });

    if (estudianteExistente) {
      this.logger.log(
        `El estudiante para el aspirante con DNI ${aspirante.dni} ya existe. No se creará uno nuevo.`,
      );
      return estudianteExistente;
    }

    const nuevoEstudiante = this.estudianteRepository.create({
      aspirante: aspirante,
      año_actual: 1,
      ciclo_lectivo: cicloLectivo,
      activo: true,
    });

    const estudianteGuardado = await manager.save(nuevoEstudiante);

    // --- INICIO DE LA SOLUCIÓN ---
    // Ahora, buscamos todos los documentos asociados al aspirante
    // y los vinculamos con el nuevo estudiante que acabamos de crear.
    const documentosDelAspirante = await manager.find(Documento, {
      where: { aspirante: { id: aspirante.id } },
    });

    for (const doc of documentosDelAspirante) {
      doc.estudiante = estudianteGuardado; // Asignamos la referencia al estudiante
      await manager.save(doc);
    }
    // --- FIN DE LA SOLUCIÓN ---

    return estudianteGuardado;
  }
  async updateActivo(id: number, activo: boolean) {
    return this.estudianteRepository.update(id, { activo });
  }

  async update(
    id: number,
    updateEstudianteDto: UpdateEstudianteDto,
  ): Promise<Estudiante> {
    const estudiante = await this.estudianteRepository.findOneBy({ id });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado.`);
    }

    // Mezcla los datos del DTO en la entidad existente
    const updatedEstudiante = this.estudianteRepository.merge(
      estudiante,
      updateEstudianteDto,
    );

    return this.estudianteRepository.save(updatedEstudiante);
  }
}
