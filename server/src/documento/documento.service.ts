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
    const documentosToSave: Documento[] = [];

    if (archivos.dniFrente && archivos.dniFrente.length > 0) {
      documentosToSave.push(
        this.documentoRepository.create({
          tipo: 'DNI Frente',
          descripcion: 'Imagen del frente del DNI',
          archivo_pdf: archivos.dniFrente[0].filename,
          aspirante: aspirante,
        }),
      );
    }

    if (archivos.dniDorso && archivos.dniDorso.length > 0) {
      documentosToSave.push(
        this.documentoRepository.create({
          tipo: 'DNI Dorso',
          descripcion: 'Imagen del dorso del DNI',
          archivo_pdf: archivos.dniDorso[0].filename,
          aspirante: aspirante,
        }),
      );
    }

    if (documentosToSave.length > 0) {
      await this.documentoRepository.save(documentosToSave);
    }
  }

  async getDocumentosByAspiranteId(aspiranteId: number) {
    // Buscar todos los documentos asociados al aspirante
    const documentos = await this.documentoRepository.find({
      where: { aspirante: { id: aspiranteId } },
    });

    // Buscar el DNI frente y dorso
    const dniFrente = documentos.find(doc => doc.tipo === 'DNI Frente');
    const dniDorso = documentos.find(doc => doc.tipo === 'DNI Dorso');

    return {
      dniFrente: dniFrente ? { url: `/uploads/documentos/${dniFrente.archivo_pdf}` } : null,
      dniDorso: dniDorso ? { url: `/uploads/documentos/${dniDorso.archivo_pdf}` } : null,
    };
  }
}
