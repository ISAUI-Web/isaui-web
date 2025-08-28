import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './documento.entity';
import { Aspirante } from '../aspirante/aspirante.entity';
import { MatriculaService } from '../matricula/matricula.service';

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
    private readonly matriculaService: MatriculaService,
  ) {}

  async guardarDocumentosAspirante(
    aspirante: Aspirante,
    archivos: {
      dniFrente?: Express.Multer.File[];
      dniDorso?: Express.Multer.File[];
    },
  ): Promise<void> {
    const processDocument = async (
      tipo: 'DNI Frente' | 'DNI Dorso',
      file?: Express.Multer.File,
    ) => {
      if (!file) return;

      // Buscamos si ya existe un documento de este tipo para el aspirante
      let documento = await this.documentoRepository.findOne({
        where: { tipo, aspirante: { id: aspirante.id } },
      });

      if (documento) {
        // Si existe, actualizamos el nombre del archivo
        // Opcional: aquí podrías agregar lógica para borrar el archivo antiguo del disco
        documento.archivo_pdf = file.filename;
      } else {
        // Si no existe, creamos una nueva instancia
        documento = this.documentoRepository.create({
          tipo,
          descripcion: `Imagen del ${tipo.toLowerCase()}`,
          archivo_pdf: file.filename,
          aspirante: aspirante,
        });
      }

      await this.documentoRepository.save(documento);
    };

    // Procesamos ambos tipos de documentos en paralelo
    await Promise.all([
      processDocument('DNI Frente', archivos.dniFrente?.[0]),
      processDocument('DNI Dorso', archivos.dniDorso?.[0]),
    ]);
  }

  async getDocumentosByAspiranteId(aspiranteId: number) {
    // Buscar todos los documentos asociados al aspirante
    const documentos = await this.documentoRepository.find({
      where: { aspirante: { id: aspiranteId } },
    });

    // Buscar el DNI frente y dorso
    const dniFrente = documentos.find((doc) => doc.tipo === 'DNI Frente');
    const dniDorso = documentos.find((doc) => doc.tipo === 'DNI Dorso');

    return {
      dniFrente: dniFrente
        ? { url: `/uploads/documentos/${dniFrente.archivo_pdf}` }
        : null,
      dniDorso: dniDorso
        ? { url: `/uploads/documentos/${dniDorso.archivo_pdf}` }
        : null,
    };
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
