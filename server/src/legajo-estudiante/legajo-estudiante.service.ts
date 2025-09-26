import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AspiranteService } from '../aspirante/aspirante.service';
import { DocumentoService } from '../documento/documento.service';
import { MatriculaService } from '../matricula/matricula.service';
import { EstudianteService } from '../estudiante/estudiante.service';
import { CreateAspiranteDto } from '../aspirante/dto/create-aspirante.dto';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';
import { Matricula } from '../matricula/matricula.entity';
import { Estudiante } from '../estudiante/estudiante.entity';
import { CarreraService } from '../carrera/carrera.service';

@Injectable()
export class LegajoEstudianteService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly aspiranteService: AspiranteService,
    private readonly documentoService: DocumentoService,
    private readonly matriculaService: MatriculaService,
    private readonly estudianteService: EstudianteService,
    private readonly carreraService: CarreraService,
    @InjectRepository(Preinscripcion)
    private readonly preinscripcionRepository: Repository<Preinscripcion>,
    @InjectRepository(Matricula)
    private readonly matriculaRepository: Repository<Matricula>,
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
  ) {}

  async crearLegajoCompleto(
    createAspiranteDto: CreateAspiranteDto,
    files: { [fieldname: string]: Express.Multer.File[] },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Asignamos el origen manual. Es importante que el DTO y la entidad Aspirante
      // tengan este campo 'origen'.
      (createAspiranteDto as any).origen = 'CREACION_MANUAL';

      // 1. Crear el aspirante SIN los archivos.
      // El servicio de aspirante ahora solo se encarga de los datos de la entidad.
      const aspirante = await this.aspiranteService.create(
        createAspiranteDto,
        undefined, // Pasamos 'undefined' para el parámetro 'files'
        queryRunner, // Pasamos el queryRunner como tercer parámetro
      );

      // 2. Delegar el guardado de archivos al DocumentoService.
      // Este servicio ya tiene la lógica correcta de nomenclatura.
      if (files && Object.keys(files).length > 0) {
        await this.documentoService.guardarDocumentosAspirante(aspirante, files, queryRunner);
      }

      const preinscripcion = await queryRunner.manager.findOneBy(
        Preinscripcion,
        { aspirante: { id: aspirante.id } },
      );
      if (!preinscripcion)
        throw new NotFoundException(
          'No se encontró la preinscripción para el aspirante.',
        );
      preinscripcion.estado = 'confirmado';
      await queryRunner.manager.save(preinscripcion);

      // 3. Reutilizar el servicio de matrícula para crearla en estado 'pendiente'
      // El método formalizarMatricula ya se encarga de esto.
      await this.matriculaService.formalizarMatricula(aspirante.id, queryRunner);

      // 4. Confirmar la matrícula recién creada y crear el estudiante
      // El método updateEstadoForAspirante ya contiene la lógica transaccional para esto.
      const matriculaConfirmada =
        await this.matriculaService.updateEstadoForAspirante(
          aspirante.id,
          'confirmado',
          queryRunner,
        );

      if (!matriculaConfirmada) {
        throw new InternalServerErrorException(
          'No se pudo confirmar la matrícula del aspirante.',
        );
      }

      // 5. Confirmar la transacción
      await queryRunner.commitTransaction();
      return {
        message: 'Legajo de alumno creado y confirmado exitosamente.',
        estudiante: matriculaConfirmada.aspirante, // El estudiante se crea dentro del servicio de matrícula
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en la creación completa del legajo:', error);
      throw new InternalServerErrorException(
        error.message || 'Error al crear el legajo del alumno.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
