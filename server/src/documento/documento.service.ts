import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Documento } from './documento.entity';
import { Aspirante } from '../aspirante/aspirante.entity';
import { MatriculaService } from '../matricula/matricula.service';
import { v2 as cloudinary } from 'cloudinary';
import { Docente } from '../docente/docente.entity';
import { Curso } from '../curso/curso.entity';

type ArchivosMatriculacion = {
  // Corresponden a los 'field' del frontend

  cus?: Express.Multer.File[];
  isa?: Express.Multer.File[];
  partida_nacimiento?: Express.Multer.File[];
  analitico?: Express.Multer.File[];
  grupo_sanguineo?: Express.Multer.File[];
  cud?: Express.Multer.File[];
  emmac?: Express.Multer.File[];
  foto_carnet?: Express.Multer.File[];
};
type CursoConArchivo = { certificadoFile?: Express.Multer.File[] };

@Injectable()
export class DocumentoService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
    @InjectRepository(Aspirante)
    private readonly aspiranteRepository: Repository<Aspirante>,
    @Inject(forwardRef(() => MatriculaService))
    private matriculaService: MatriculaService,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  private tipoDocumentoMap: { [key: string]: string } = {
    dniFrente: 'DNI Frente',
    dniDorso: 'DNI Dorso',
    cus: 'CUS',
    foto_carnet: 'Foto Carnet 4x4',
    isa: 'ISA',
    partida_nacimiento: 'Partida de Nacimiento',
    analitico: 'Analítico Nivel Secundario',
    grupo_sanguineo: 'Certificado de Grupo Sanguíneo',
    cud: 'CUD',
    emmac: 'EMMAC',

    // Tipos de documentos para Docentes
    titulo_secundario: 'Título Nivel Secundario',
    titulo_terciario: 'Título Nivel Terciario/Superior',
    examen_psicofisico: 'Examen Psicofísico',
    regimen_de_compatibilidad: 'Régimen de Compatibilidad',
  };

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'documentos', // Carpeta en Cloudinary donde se guardarán los archivos
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          // Añadimos una comprobación para asegurar que 'result' no es undefined.
          if (result) {
            resolve(result.secure_url);
          } else {
            // Si no hay error pero tampoco resultado, rechazamos la promesa.
            reject(new Error('La subida a Cloudinary falló sin devolver un resultado.'));
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  private async deleteFromCloudinary(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  }

  private getPublicIdFromUrl(url: string): string | null {
    const match = url.match(/\/documentos\/([^/.]+)/);
    return match ? `documentos/${match[1]}` : null;
  }

  async guardarDocumentosAspirante(
    aspirante: Aspirante,
    archivos: { [fieldname: string]: Express.Multer.File[] },
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.documentoRepository.manager;

    for (const fieldName in archivos) {
      const fileArray = archivos[fieldName];
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        const tipoDocumento = this.tipoDocumentoMap[fieldName] || fieldName;

        // Subir el archivo a Cloudinary y obtener la URL
        const fileUrl = await this.uploadToCloudinary(file);

        // Crear o actualizar el registro del documento en la BD
        let documento = await manager.findOne(Documento, {
          where: { aspirante: { id: aspirante.id }, tipo: tipoDocumento },
        });

        if (documento) {
          // Borrar el archivo antiguo de Cloudinary antes de actualizar la URL
          const publicId = this.getPublicIdFromUrl(documento.archivo_pdf);
          if (publicId) {
            await this.deleteFromCloudinary(publicId).catch(console.error);
          }

          documento.archivo_pdf = fileUrl; // Actualiza con la nueva URL
        } else {
          documento = manager.create(Documento, {
            aspirante: aspirante,
            tipo: tipoDocumento,
            descripcion: `Documento de ${tipoDocumento}`,
            archivo_pdf: fileUrl,
            fecha_subida: new Date(),
            validado: false,
          });
        }
        await manager.save(documento);
      }
    }
  }

  async guardarDocumentosDocente(
    docente: Docente,
    archivos: { [fieldname: string]: Express.Multer.File[] },
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.documentoRepository.manager;

    for (const fieldName in archivos) {
      const fileArray = archivos[fieldName];
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        // Subir el archivo a Cloudinary y obtener la URL
        const fileUrl = await this.uploadToCloudinary(file);
        const tipoDocumento = this.tipoDocumentoMap[fieldName] || fieldName;

        // Crear o actualizar el registro del documento en la BD
        let documento = await manager.findOne(Documento, {
          where: { docente: { id: docente.id }, tipo: tipoDocumento },
        });

        if (documento) {
          // Borrar el archivo antiguo de Cloudinary antes de actualizar la URL
          // Se verifica que la URL sea de Cloudinary para no intentar borrar archivos locales/placeholders
          const isCloudinaryUrl = documento.archivo_pdf.includes('cloudinary.com');
          const publicId = isCloudinaryUrl ? this.getPublicIdFromUrl(documento.archivo_pdf) : null;

          if (publicId) {
            await this.deleteFromCloudinary(publicId).catch(console.error);
          }

          documento.archivo_pdf = fileUrl; // Actualiza con la nueva URL
          documento.fecha_subida = new Date();
        } else {
          documento = manager.create(Documento, {
            docente: docente,
            tipo: tipoDocumento,
            descripcion: `Documento de ${tipoDocumento}`,
            archivo_pdf: fileUrl,
            fecha_subida: new Date(),
            validado: false,
          });
        }
        await manager.save(documento);
      }
    }
  }

  async guardarCertificadosCurso(
    docente: Docente,
    cursosData: { id?: number | string; nombre: string }[],
    archivosCursos: CursoConArchivo[],
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const manager = queryRunner
      ? queryRunner.manager
      : this.cursoRepository.manager;

    for (let i = 0; i < cursosData.length; i++) {
      const cursoInfo = cursosData[i];
      const archivoInfo = archivosCursos[i];
      const file = archivoInfo?.certificadoFile?.[0];

      let certificadoUrl = null;

      // Si hay un archivo, lo subimos a Cloudinary
      if (file) {
        certificadoUrl = await this.uploadToCloudinary(file);
      }

      // Si el curso tiene un ID, es un curso existente que podría estar actualizándose.
      if (cursoInfo.id && typeof cursoInfo.id === 'number') {
        const cursoExistente = await manager.findOne(Curso, {
          where: { id: cursoInfo.id },
        });
        if (cursoExistente) {
          cursoExistente.nombre = cursoInfo.nombre;
          // Si se subió un nuevo certificado, actualizamos la URL.
          if (certificadoUrl) {
            // Borrar el certificado antiguo de Cloudinary antes de actualizar la URL
            if (cursoExistente.certificado_url && cursoExistente.certificado_url.includes('cloudinary.com')) {
              const publicId = this.getPublicIdFromUrl(cursoExistente.certificado_url);
              if (publicId) {
                await this.deleteFromCloudinary(publicId).catch(console.error);
              }
            }
            cursoExistente.certificado_url = certificadoUrl;
          }
          await manager.save(cursoExistente);
        }
      } else {
        // Si no tiene ID, es un curso nuevo.
        const nuevoCurso = manager.create(Curso, {
          nombre: cursoInfo.nombre,
          certificado_url: certificadoUrl, // Será la URL de Cloudinary o null
          docente: docente,
        });
        await manager.save(nuevoCurso);
      }
    }
  }

  async getDocumentosByDocenteId(
    docenteId: number,
  ): Promise<{ [key: string]: string | null }> {
    const documentos = await this.documentoRepository.find({
      where: { docente: { id: docenteId } },
    });

    const documentosMapeados: { [key: string]: string | null } = {};

    // Mapeo inverso: de 'tipo' en BD a 'key' en el frontend
    const tipoToKeyMap: { [key: string]: string } = {
      'DNI Frente': 'dniFrenteUrl',
      'DNI Dorso': 'dniDorsoUrl',
      'Título Nivel Secundario': 'titulo_secundarioUrl',
      'Título Nivel Terciario/Superior': 'titulo_terciarioUrl',
      'Examen Psicofísico': 'examen_psicofisicoUrl',
      'Régimen de Compatibilidad': 'regimen_de_compatibilidadUrl',
    };

    // Inicializar todas las posibles URLs a null
    Object.values(tipoToKeyMap).forEach(key => {
      documentosMapeados[key] = null;
    });

    documentos.forEach((doc) => {
      const key = tipoToKeyMap[doc.tipo];
      if (key) {
        // La BD ahora guarda la URL completa, así que la usamos directamente
        documentosMapeados[key] = doc.archivo_pdf;
      }
    });

    return documentosMapeados;
  }

  async getDocumentosByAspiranteId(
    aspiranteId: number,
  ): Promise<{ [key: string]: string | null }> {
    // Buscar todos los documentos asociados al aspirante
    const documentos = await this.documentoRepository.find({
      where: { aspirante: { id: aspiranteId } },
    });

    const documentosMapeados: { [key: string]: string | null } = {};

    // Mapeo de 'tipo' en BD a 'key' en el frontend
    const tipoToKeyMap: { [key: string]: string } = {
      'DNI Frente': 'dniFrenteUrl',
      'DNI Dorso': 'dniDorsoUrl',
      CUS: 'cusUrl',
      ISA: 'isaUrl',
      'Partida de Nacimiento': 'partida_nacimientoUrl',
      'Analítico Nivel Secundario': 'analiticoUrl',
      'Certificado de Grupo Sanguíneo': 'grupo_sanguineoUrl',
      CUD: 'cudUrl',
      EMMAC: 'emmacUrl',
      'Foto Carnet 4x4': 'foto_carnetUrl',
    };

    documentos.forEach((doc) => {
      const key = tipoToKeyMap[doc.tipo];
      if (key) {
        // La BD ahora guarda la URL completa, así que la usamos directamente
        documentosMapeados[key] = doc.archivo_pdf;
      }
    });

    return documentosMapeados;
  }

  async uploadDocumentos(
    aspiranteId: number,
    files: { [fieldname: string]: Express.Multer.File[] },
    queryRunner?: QueryRunner,
  ) {
    const aspirante = await this.aspiranteRepository.findOneBy({
      id: aspiranteId,
    });
    if (!aspirante) {
      throw new NotFoundException('Aspirante no encontrado');
    }
    return this.guardarDocumentosAspirante(aspirante, files, queryRunner);
  }

  async guardarDocumentosMatriculacion(
    aspiranteId: number,
    archivos: ArchivosMatriculacion,
  ): Promise<Documento[]> {
    const aspirante = await this.aspiranteRepository.findOneBy({
      id: aspiranteId,
    });
    if (!aspirante) {
      throw new NotFoundException(
        `Aspirante con ID ${aspiranteId} no encontrado`,
      );
    }

    const processDocument = async (
      tipo: string,
      file?: Express.Multer.File,
    ) => {
      if (!file) return null;

      let documento = await this.documentoRepository.findOne({
        where: { tipo, aspirante: { id: aspirante.id } },
      });

      // Subir el archivo a Cloudinary y obtener la URL
      const fileUrl = await this.uploadToCloudinary(file);

      if (documento) {
        // Opcional: lógica para borrar el archivo antiguo de Cloudinary
        documento.archivo_pdf = fileUrl;
      } else {
        documento = this.documentoRepository.create({
          tipo,
          descripcion: `Documento de matriculación: ${tipo}`,
          archivo_pdf: fileUrl,
          aspirante: aspirante,
        });
      }

      return this.documentoRepository.save(documento);
    };

    const mapeoTipos: { [key in keyof ArchivosMatriculacion]: string } = {
      // Mapea el 'field' del frontend al 'tipo' en la BD

      cus: 'CUS',
      isa: 'ISA',
      partida_nacimiento: 'Partida de Nacimiento',
      analitico: 'Analítico Nivel Secundario',
      grupo_sanguineo: 'Certificado de Grupo Sanguíneo',
      cud: 'CUD',
      emmac: 'EMMAC',
      foto_carnet: 'Foto Carnet 4x4',
    };

    const promesas = Object.keys(archivos).map((key) => {
      const file = archivos[key as keyof ArchivosMatriculacion]?.[0];
      const tipo = mapeoTipos[key as keyof ArchivosMatriculacion];
      if (!tipo) {
        return null; // Ignora campos no esperados y soluciona el error de TS
      }
      return processDocument(tipo, file);
    });

    const documentosGuardados = (await Promise.all(promesas)).filter(Boolean);

    // Una vez guardados los documentos, formalizamos la matrícula
    await this.matriculaService.formalizarMatricula(aspiranteId);

    return documentosGuardados as Documento[];
  }
}
