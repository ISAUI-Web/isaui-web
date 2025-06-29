import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aspirante } from './aspirante.entity';
import { CreateAspiranteDto } from './dto/create-aspirante.dto';
import { DocumentoService } from '../documento/documento.service';

@Injectable()
export class AspiranteService {
  constructor(
    @InjectRepository(Aspirante)
    private readonly aspiranteRepository: Repository<Aspirante>,
    private readonly documentoService: DocumentoService,
  ) {}

  async create(
    dto: CreateAspiranteDto,
    archivos?: {
      dniFrente?: Express.Multer.File[];
      dniDorso?: Express.Multer.File[];
    },
  ): Promise<Aspirante> {
    // Crear y guardar el aspirante
    const aspirante = this.aspiranteRepository.create(dto);
    const savedAspirante = await this.aspiranteRepository.save(aspirante);

    // Si hay archivos, guardar documentos asociados
    if (archivos) {
      await this.documentoService.guardarDocumentosAspirante(
        savedAspirante,
        archivos,
      );
    }

    return savedAspirante;
  }
}
