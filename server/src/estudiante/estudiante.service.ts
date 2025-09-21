import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from './estudiante.entity';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Matricula } from '../matricula/matricula.entity';
import { Documento } from '../documento/documento.entity';

@Injectable()
export class EstudianteService {
  private readonly logger = new Logger(EstudianteService.name);

  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(Matricula)
    private readonly matriculaRepository: Repository<Matricula>,
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
  ) {}

  async findByAspiranteId(aspiranteId: number): Promise<any> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { aspirante: { id: aspiranteId } },
      relations: {
        aspirante: {
          preinscripciones: {
            carrera: true,
          },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException(
        `No se encontró un estudiante para el aspirante con ID ${aspiranteId}`,
      );
    }

    const matricula = await this.matriculaRepository.findOne({
      where: { aspirante: { id: aspiranteId } },
    });

    const aspirante = estudiante.aspirante;
    const preinscripcion = aspirante.preinscripciones?.[0];
    const carreraNombre = preinscripcion?.carrera?.nombre || 'N/A';

    const documentos = await this.documentoRepository.find({
      where: { aspirante: { id: aspiranteId } },
    });

    const documentosMapeados: { [key: string]: string } = {};
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

    // Componemos un objeto aspirante que coincide con lo que el frontend espera
    const aspiranteData = {
      ...aspirante,
      carrera: carreraNombre,
      estado_preinscripcion: preinscripcion?.estado || 'N/A',
      estado_matriculacion: matricula?.estado || 'no matriculado',
      ...documentosMapeados,
    };

    // Devolvemos el objeto estudiante con los datos del aspirante anidados
    const response = {
      ...estudiante,
      aspirante: aspiranteData,
    };

    return response;
  }

  async crearEstudianteDesdeAspirante(
    aspirante: Aspirante,
  ): Promise<Estudiante> {
    const estudianteExistente = await this.estudianteRepository.findOne({
      where: { aspirante: { id: aspirante.id } },
    });

    if (estudianteExistente) {
      this.logger.log(
        `El estudiante para el aspirante con DNI ${aspirante.dni} ya existe. No se creará uno nuevo.`,
      );
      return estudianteExistente;
    }

    const nuevoEstudiante = this.estudianteRepository.create({
      aspirante: aspirante,
      año_actual: 1,
      ciclo_lectivo: new Date().getFullYear(),
      activo: true,
    });

    return this.estudianteRepository.save(nuevoEstudiante);
  }
}
