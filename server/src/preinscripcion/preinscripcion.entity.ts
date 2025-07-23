import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Carrera } from '../carrera/carrera.entity';

@Entity()
export class Preinscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha_preinscripcion: Date;

  @Column()
  estado: string;

  // Relación con Aspirante
  @ManyToOne(() => Aspirante, (aspirante) => aspirante.preinscripciones, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'aspirante_id' })
  aspirante: Aspirante;

  @Column({ nullable: true })
  aspirante_id: number;

  // Relación con Carrera
  @ManyToOne(() => Carrera, (carrera) => carrera.preinscripciones, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({ nullable: true })
  carrera_id: number;
}
