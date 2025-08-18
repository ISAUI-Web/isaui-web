import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from './documento.entity';
import { Aspirante } from '../aspirante/aspirante.entity';

@Injectable()
export class DocumentoService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
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
}
