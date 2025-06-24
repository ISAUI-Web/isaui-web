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
export class Matricula {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha_matricula: Date;

  @Column()
  estado: string;

  @Column()
  constancia_pdf: string;

  @ManyToOne(() => Aspirante)
  @JoinColumn({ name: 'aspirante_id' })
  aspirante: Aspirante;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;
}
