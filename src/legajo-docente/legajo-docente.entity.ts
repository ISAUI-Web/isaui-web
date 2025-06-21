import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Docente } from '../docente/docente.entity';
import { Documento } from '../documento/documento.entity';

@Entity()
export class LegajoDocente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  observaciones_docente: string;

  @OneToOne(() => Docente, { onDelete: 'CASCADE' })
  @JoinColumn()
  docente: Docente;

  @OneToMany(() => Documento, (documento) => documento.legajoDocente)
  documentos: Documento[];
}
