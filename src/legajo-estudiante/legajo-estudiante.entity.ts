import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Estudiante } from '../estudiante/estudiante.entity';
import { Documento } from '../documento/documento.entity';

@Entity()
export class LegajoEstudiante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  observaciones_internas: string;

  @OneToOne(() => Estudiante, { onDelete: 'CASCADE' })
  @JoinColumn()
  estudiante: Estudiante;

  @OneToMany(() => Documento, (documento) => documento.legajoEstudiante)
  documentos: Documento[];
}
