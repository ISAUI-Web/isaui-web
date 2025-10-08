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
