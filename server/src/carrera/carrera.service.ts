import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
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

  async findAll(): Promise<Carrera[]> {
    return this.carreraRepository.find();
  }

  async create(data: Partial<Carrera>): Promise<Carrera> {
    // 🚫 Verificar duplicado
    const existente = await this.carreraRepository.findOne({
      where: { nombre: data.nombre },
    });
    if (existente) {
      throw new Error(`La carrera "${data.nombre}" ya existe`);
    }

    const nuevaCarrera = this.carreraRepository.create(data);
    return this.carreraRepository.save(nuevaCarrera);
  }

  async update(id: number, data: Partial<Carrera>): Promise<Carrera> {
    const carrera = await this.carreraRepository.findOne({ where: { id } });
    if (!carrera) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }

    // 🚫 Validar nombre duplicado
    if (data.nombre) {
      const existente = await this.carreraRepository.findOne({ where: { nombre: data.nombre } });
      if (existente && existente.id !== id) {
        throw new Error(`Ya existe otra carrera con el nombre "${data.nombre}"`);
      }
    }

    Object.assign(carrera, data);
    return this.carreraRepository.save(carrera);
  }

  async remove(id: number): Promise<void> {
    const result = await this.carreraRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }
  }
}