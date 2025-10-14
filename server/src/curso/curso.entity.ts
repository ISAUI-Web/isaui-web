import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Docente } from '../docente/docente.entity';

@Entity()
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  certificado_url: string;

  @ManyToOne(() => Docente, (docente) => docente.cursos)
  @JoinColumn({ name: 'docente_id' })
  docente: Docente;
}
