import {
  Injectable,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DocumentoService } from '../documento/documento.service';
import { Docente } from './docente.entity';
import { LegajoDocente } from '../legajo-docente/legajo-docente.entity';
import { Documento } from '../documento/documento.entity';
import { CreateDocenteDto } from './dto/create-docente.dto';

@Injectable()
export class DocenteService {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepository: Repository<Docente>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => DocumentoService))
    private readonly documentoService: DocumentoService,
  ) {}

  async findAll(): Promise<any[]> {
  const docentes = await this.docenteRepository.find({
    where: { activo: true }, // solo docentes activos
  });


  return docentes.map((docente) => {
    return {
      id: docente.id,           // ID del docente
      nombre: docente.nombre,
      apellido: docente.apellido,
      dni: docente.dni,
      titulo: docente.titulo || 'N/A',
      email: docente.email || 'N/A',
      telefono: docente.telefono || 'N/A',
      fecha_nacimiento: docente.fecha_nacimiento || 'N/A',
      ciudad_nacimiento: docente.ciudad_nacimiento || 'N/A',
      provincia_nacimiento: docente.provincia_nacimiento || 'N/A',
      // Nivel medio
      completo_nivel_medio: docente.completo_nivel_medio || 'N/A',
      anio_ingreso_medio: docente.anio_ingreso_medio || 'N/A',
      anio_egreso_medio: docente.anio_egreso_medio || 'N/A',
      provincia_medio: docente.provincia_medio || 'N/A',
      titulo_medio: docente.titulo_medio || 'N/A',
      // Nivel superior
      completo_nivel_superior: docente.completo_nivel_superior || 'N/A',
      carrera_superior: docente.carrera_superior || 'N/A',
      institucion_superior: docente.institucion_superior || 'N/A',
      provincia_superior: docente.provincia_superior || 'N/A',
      anio_ingreso_superior: docente.anio_ingreso_superior || 'N/A',
      anio_egreso_superior: docente.anio_egreso_superior || 'N/A',
    };
  });
}

async updateActivo(id: number, activo: boolean) {
  const docente = await this.docenteRepository.findOne({ where: { id } });
  if (!docente) throw new Error('Docente no encontrado');

  docente.activo = activo;
  await this.docenteRepository.save(docente);

  return { message: 'Estado actualizado correctamente' };
}

  async create(
    createDocenteDto: CreateDocenteDto,
    files: { [fieldname: string]: Express.Multer.File[] },
  ) {
    const { dni, observaciones_docente, ...docenteData } = createDocenteDto;

    const existingDocente = await this.docenteRepository.findOne({
      where: { dni },
    });
    if (existingDocente) {
      throw new ConflictException(`Ya existe un docente con el DNI ${dni}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear y guardar el docente
      const nuevoDocente = queryRunner.manager.create(Docente, {
        ...docenteData,
        dni,
      });
      const docenteGuardado = await queryRunner.manager.save(nuevoDocente);

      // 2. Crear y guardar los documentos
      if (files) {
        await this.documentoService.guardarDocumentosDocente(
          docenteGuardado,
          files,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();

      // Devolver el docente completo con su legajo y documentos
      return await this.docenteRepository.findOne({
        where: { id: docenteGuardado.id },
        relations: ['documentos'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
