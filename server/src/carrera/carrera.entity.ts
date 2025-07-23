import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';

@Entity()
export class Carrera {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ name: 'cupo_maximo' })
  cupo_maximo: number;

  @Column({ name: 'cupo_actual' })
  cupo_actual: number;

  @OneToMany(() => Preinscripcion, (preinscripcion) => preinscripcion.carrera)
  preinscripciones: Preinscripcion[];
}
