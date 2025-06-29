import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Carrera } from './carrera.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CarreraService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Carrera)
    private carreraRepository: Repository<Carrera>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCarreras();
  }

  async seedCarreras() {
    const carreras = [
      {
        nombre: 'Técnico Superior en Desarrollo de Software',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Técnico Superior en Diseño de Espacios',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Técnico Superior en Turismo y Hotelería',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Técnico Superior en Enfermería',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Guía Superior en Turismo',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
      {
        nombre: 'Guía Superior en Trekking y de Montaña',
        cupo_maximo: 50,
        cupo_actual: 50,
      },
    ];

    for (const carrera of carreras) {
      const existe = await this.carreraRepository.findOneBy({
        nombre: carrera.nombre,
      });
      if (!existe) {
        await this.carreraRepository.save(carrera);
      }
    }
  }
}
