import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Aspirante } from '../aspirante/aspirante.entity';

@Entity()
export class Estudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  año_actual: number;

  @Column()
  ciclo_lectivo: number;

  @Column({ default: true })
  activo: boolean;

  @OneToOne(() => Aspirante)
  @JoinColumn({ name: 'aspirante_id' })
  aspirante: Aspirante;
}
