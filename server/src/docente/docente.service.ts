import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DocumentoService } from '../documento/documento.service';
import { Docente } from './docente.entity';
import { LegajoDocente } from '../legajo-docente/legajo-docente.entity';
import { Curso } from '../curso/curso.entity';
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

  async findOne(id: number): Promise<any> {
    const docente = await this.docenteRepository.findOne({
      where: { id },
      relations: ['cursos'], // Carga los cursos relacionados
    });

    if (!docente) {
      throw new Error('Docente no encontrado');
    }

    // Obtener los documentos mapeados desde el servicio de documentos
    const documentos = await this.documentoService.getDocumentosByDocenteId(id);

    // Formatear la fecha de nacimiento
    const fechaNacimiento = docente.fecha_nacimiento
      ? new Date(docente.fecha_nacimiento).toISOString().split('T')[0]
      : '';

    return {
      ...docente,
      fecha_nacimiento: fechaNacimiento,
      documentos, // Añadir el objeto de documentos mapeado
    };
  }

  async create(
    createDocenteDto: CreateDocenteDto,
    files: Array<Express.Multer.File>,
  ) {
    const {
      dni,
      observaciones_docente,
      cursos: cursosData, // Extraemos los cursos del DTO
      ...docenteData
    } = createDocenteDto;

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

      // 2. Procesar y guardar documentos y cursos
      const documentosFiles: { [fieldname: string]: Express.Multer.File[] } = {};
      const cursosFiles: { [fieldname: string]: Express.Multer.File } = {};

      // Separar los archivos de documentos de los de cursos
      if (files && files.length > 0) {
        files.forEach(file => {
          if (file.fieldname.startsWith('cursos[')) {
            cursosFiles[file.fieldname] = file;
          } else {
            documentosFiles[file.fieldname] = [file];
          }
        });
      }

      // 3. Guardar los documentos del docente
      if (Object.keys(documentosFiles).length > 0) {
        await this.documentoService.guardarDocumentosDocente(
          docenteGuardado,
          documentosFiles,
          queryRunner,
        );
      }

      // 4. Guardar los cursos y sus certificados
      if (cursosData && cursosData.length > 0) {
        for (let i = 0; i < cursosData.length; i++) {
          let cursoInfo: { nombre: string };
          try {
            // Parseamos el string JSON que viene del frontend
            cursoInfo = JSON.parse(cursosData[i]);
          } catch (e) {
            throw new BadRequestException(
              'Formato de cursos inválido. Se esperaba un string JSON.',
            );
          }
          // Validamos que el objeto parseado tenga la propiedad 'nombre'
          if (
            !cursoInfo ||
            typeof cursoInfo.nombre !== 'string' ||
            cursoInfo.nombre.trim() === ''
          ) {
            throw new BadRequestException(
              `El curso en el índice ${i} debe tener un nombre válido.`,
            );
          }

          const fileKey = `cursos[${i}][certificadoFile]`;
          const certificadoFile = cursosFiles[fileKey];

          const nuevoCurso = queryRunner.manager.create(Curso, {
            nombre: cursoInfo.nombre,
            // Usamos 'undefined' en lugar de 'null' para que TypeORM lo ignore si no hay archivo
            // y se aplique el valor por defecto de la base de datos (que es null).
            certificado_url: certificadoFile
              ? certificadoFile.filename
              : undefined,
            docente: docenteGuardado,
          });
          await queryRunner.manager.save(nuevoCurso);
        }
      }

      await queryRunner.commitTransaction();

      // Devolver el docente completo con su legajo y documentos
      return await this.docenteRepository.findOne({
        where: { id: docenteGuardado.id },
        relations: ['documentos', 'cursos'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateData: CreateDocenteDto, files: Array<Express.Multer.File>) {
    const { cursos: cursosData, ...docenteData } = updateData;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Buscar el docente
      const docente = await queryRunner.manager.findOne(Docente, {
        where: { id },
        relations: ['cursos'],
      });
      if (!docente) {
        throw new NotFoundException(`Docente con ID ${id} no encontrado.`);
      }

      // 2. Actualizar los datos del docente
      queryRunner.manager.merge(Docente, docente, docenteData);
      await queryRunner.manager.save(docente);

      // 3. Procesar y guardar documentos
      const documentosFiles: { [fieldname: string]: Express.Multer.File[] } = {};
      const cursosFiles: { [fieldname: string]: Express.Multer.File } = {};

      if (files && files.length > 0) {
        files.forEach(file => {
          if (file.fieldname.startsWith('cursos[')) {
            cursosFiles[file.fieldname] = file;
          } else {
            documentosFiles[file.fieldname] = [file];
          }
        });
      }

      if (Object.keys(documentosFiles).length > 0) {
        await this.documentoService.guardarDocumentosDocente(docente, documentosFiles, queryRunner);
      }

      // 4. Sincronizar cursos
      if (cursosData) {
        const cursosFrontend = cursosData.map(c => JSON.parse(c));
        const idsCursosFrontend = cursosFrontend.map(c => c.id).filter(id => typeof id === 'number');

        // Eliminar cursos que ya no están en el frontend
        for (const cursoExistente of docente.cursos) {
          if (!idsCursosFrontend.includes(cursoExistente.id)) {
            await queryRunner.manager.remove(cursoExistente);
          }
        }

        // Actualizar o crear cursos
        for (let i = 0; i < cursosFrontend.length; i++) {
          const cursoInfo = cursosFrontend[i];
          const fileKey = `cursos[${i}][certificadoFile]`;
          const certificadoFile = cursosFiles[fileKey];

          if (typeof cursoInfo.id === 'number') {
            // Actualizar curso existente
            const cursoAActualizar = await queryRunner.manager.findOneBy(Curso, { id: cursoInfo.id });
            if (cursoAActualizar) {
              cursoAActualizar.nombre = cursoInfo.nombre;
              if (certificadoFile) {
                cursoAActualizar.certificado_url = certificadoFile.filename;
              }
              await queryRunner.manager.save(cursoAActualizar);
            }
          } else {
            // Crear nuevo curso
            const nuevoCurso = queryRunner.manager.create(Curso, {
              nombre: cursoInfo.nombre,
              certificado_url: certificadoFile ? certificadoFile.filename : undefined,
              docente: docente,
            });
            await queryRunner.manager.save(nuevoCurso);
          }
        }
      }

      await queryRunner.commitTransaction();

      // Devolver el docente actualizado
      return await this.docenteRepository.findOne({
        where: { id },
        relations: ['documentos', 'cursos'],
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error en la actualización:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
