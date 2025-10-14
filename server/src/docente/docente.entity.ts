import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { LegajoDocente } from '../legajo-docente/legajo-docente.entity';
import { Documento } from '../documento/documento.entity';
import { Curso } from '../curso/curso.entity';

@Entity()
export class Docente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  nombre: string;

  @Column({ nullable: true })
  apellido: string;

  @Column({ unique: true })
  dni: string;

  @Column({ nullable: true })
  sexo: string;

  @Column({ nullable: true })
  cuil: string;

  @Column({ nullable: true })
  domicilio: string;

  @Column({ nullable: true })
  localidad: string;

  @Column({ nullable: true })
  barrio: string;

  @Column({ nullable: true })
  codigo_postal: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ nullable: true })
  ciudad_nacimiento: string;

  @Column({ nullable: true })
  provincia_nacimiento: string;

  @Column({ nullable: true })
  titulo: string;

  @Column({ nullable: true })
  completo_nivel_medio: string;

  @Column({ nullable: true })
  anio_ingreso_medio: string;

  @Column({ nullable: true })
  anio_egreso_medio: string;

  @Column({ nullable: true })
  provincia_medio: string;

  @Column({ nullable: true })
  titulo_medio: string;

  @Column({ nullable: true })
  completo_nivel_superior: string;

  @Column({ nullable: true })
  carrera_superior: string;

  @Column({ nullable: true })
  institucion_superior: string;

  @Column({ nullable: true })
  provincia_superior: string;

  @Column({ nullable: true })
  anio_ingreso_superior: string;

  @Column({ nullable: true })
  anio_egreso_superior: string;

  @Column({ nullable: true })
  trabajo: string;

  @Column({ nullable: true })
  horas_diarias: string;

  @Column({ nullable: true })
  descripcion_trabajo: string;

  @Column({ nullable: true })
  personas_cargo: string;

  @Column({ nullable: true })
  observaciones_docente: string;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => Documento, (documento) => documento.docente)
  documentos: Documento[];

  @OneToMany(() => Curso, (curso) => curso.docente, { cascade: true })
  cursos: Curso[];

  @Column({ default: true })
  activo: boolean;
}
