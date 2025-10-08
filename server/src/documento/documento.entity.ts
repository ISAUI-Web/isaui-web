import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Aspirante } from '../aspirante/aspirante.entity';
import { Estudiante } from '../estudiante/estudiante.entity';
import { Usuario } from '../usuario/usuario.entity';
import { Docente } from '../docente/docente.entity';
import { LegajoEstudiante } from '../legajo-estudiante/legajo-estudiante.entity';

@Entity()
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'int', nullable: true })
  año: number;

  @Column()
  archivo_pdf: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_subida: Date;

  @Column({ default: false })
  validado: boolean;

  @Column({ nullable: true })
  observaciones: string;

  @ManyToOne(() => Aspirante, { nullable: true })
  @JoinColumn({ name: 'aspirante_id' })
  aspirante: Aspirante;

  @ManyToOne(() => Estudiante, { nullable: true })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @ManyToOne(() => Docente, { nullable: true })
  @JoinColumn({ name: 'docente_id' })
  docente: Docente;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'validador_id' })
  validador: Usuario;

  @ManyToOne(() => LegajoEstudiante, (legajo) => legajo.documentos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  legajoEstudiante: LegajoEstudiante;
}
