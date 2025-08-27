import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';

@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(Aspirante)
    private aspiranteRepository: Repository<Aspirante>,
    @InjectRepository(Preinscripcion)
    private preinscripcionRepository: Repository<Preinscripcion>,
  ) {}

  async validarAccesoMatricula(dni: string) {
    // Buscar aspirante por DNI
    const aspirante = await this.aspiranteRepository.findOne({
      where: { dni },
    });

    if (!aspirante) {
      return { ok: false, reason: 'No existe un aspirante con ese DNI.' };
    }

    // Buscar preinscripción confirmada
    const preinscripcionConfirmada = await this.preinscripcionRepository.findOne({
      where: {
        aspirante_id: aspirante.id,
        estado: 'Confirmado',
      },
    });

    if (!preinscripcionConfirmada) {
      return { ok: false, reason: 'La preinscripción no está confirmada.' };
    }

    // Todo ok, puede iniciar la matrícula
    return {
      ok: true,
      aspirante: {
        id: aspirante.id,
        nombre: aspirante.nombre,
        apellido: aspirante.apellido,
        dni: aspirante.dni,
        email: aspirante.email,
      },
    };
  }
}