import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Preinscripcion } from './preinscripcion.entity';
import { CreatePreinscripcionDto } from './dto/create-preinscripcion.dto';
import { Aspirante } from '../aspirante/aspirante.entity';
import { ConstanciaService } from '../constancia/constancia.service';

@Injectable()
export class PreinscripcionService {
  constructor(
    @InjectRepository(Preinscripcion)
    private readonly preinscripcionRepository: Repository<Preinscripcion>,

    @InjectRepository(Aspirante)
    private readonly aspiranteRepository: Repository<Aspirante>,
    private readonly constanciaService: ConstanciaService,
  ) {}

  async create(
    createPreinscripcionDto: CreatePreinscripcionDto,
  ): Promise<Preinscripcion> {
    const preinscripcion = this.preinscripcionRepository.create({
      ...createPreinscripcionDto,
      estado: 'pendiente',
      fecha_preinscripcion: new Date(),
    });

    // La lógica de envío de constancia se ha movido a AspiranteService.create
    // para unificar el flujo de creación de aspirante + preinscripción.
    return this.preinscripcionRepository.save(preinscripcion);
  }

  async updateEstadoForAspirante(aspiranteId: number, estado: string) {
    // Asumimos que un aspirante solo tiene una preinscripción activa a la vez.
    const preinscripcion = await this.preinscripcionRepository.findOne({
      where: { aspirante: { id: aspiranteId } },
    });

    if (preinscripcion) {
      preinscripcion.estado = estado;
      await this.preinscripcionRepository.save(preinscripcion);
    }
  }

  async find(
    options: FindManyOptions<Preinscripcion>,
  ): Promise<Preinscripcion[]> {
    return this.preinscripcionRepository.find(options);
  }
}
