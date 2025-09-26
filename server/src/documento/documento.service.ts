import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Documento } from './documento.entity';
import { Aspirante } from '../aspirante/aspirante.entity';
import { MatriculaService } from '../matricula/matricula.service';
import * as fs from 'fs/promises';
import * as path from 'path';

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

@Injectable()
export class DocumentoService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
    @InjectRepository(Aspirante)
    private readonly aspiranteRepository: Repository<Aspirante>,
    @Inject(forwardRef(() => MatriculaService))
    private matriculaService: MatriculaService,
  ) {}

  private readonly uploadPath = path.join(
    __dirname,
    '..',
    '..',
    'public',
    'uploads',
    'documentos',
  );

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
  };

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

        // El archivo ya fue guardado en disco por Multer con el nombre correcto.
        // Solo necesitamos el nombre del archivo para guardarlo en la BD.
        const filename = file.filename;

        // Crear o actualizar el registro del documento en la BD
        let documento = await manager.findOne(Documento, {
          where: { aspirante: { id: aspirante.id }, tipo: tipoDocumento },
        });

        if (documento) {
          // Opcional: borrar el archivo antiguo si se está reemplazando
          documento.archivo_pdf = filename; // Actualiza con el nuevo nombre de archivo
        } else {
          documento = manager.create(Documento, {
            aspirante: aspirante,
            tipo: tipoDocumento,
            descripcion: `Documento de ${tipoDocumento}`,
            archivo_pdf: filename,
            fecha_subida: new Date(),
            validado: false,
          });
        }
        await manager.save(documento);
      }
    }
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
        documentosMapeados[key] = `/uploads/documentos/${doc.archivo_pdf}`;
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

      if (documento) {
        // Opcional: aquí se podría agregar lógica para borrar el archivo antiguo del disco
        documento.archivo_pdf = file.filename;
      } else {
        documento = this.documentoRepository.create({
          tipo,
          descripcion: `Documento de matriculación: ${tipo}`,
          archivo_pdf: file.filename,
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
