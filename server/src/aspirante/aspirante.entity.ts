import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Preinscripcion } from '../preinscripcion/preinscripcion.entity';

@Entity()
export class Aspirante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  email: string;

  @Column()
  dni: string;

  @Column()
  sexo: string;

  @Column()
  cuil: string;

  @Column()
  domicilio: string;

  @Column()
  localidad: string;

  @Column()
  barrio: string;

  @Column()
  codigo_postal: string;

  @Column()
  telefono: string;

  @Column({ type: 'date' })
  fecha_nacimiento: Date;

  @Column()
  provincia_nacimiento: string;

  @Column()
  ciudad_nacimiento: string;

  @Column()
  estado_preinscripcion: string;

  @Column()
  estado_matriculacion: string;

  // Nivel medio
  @Column()
  completo_nivel_medio: boolean;

  @Column({ name: 'año_ingreso_medio' })
  anio_ingreso_medio: number;

  @Column({ name: 'año_egreso_medio' })
  anio_egreso_medio: number;

  @Column()
  provincia_medio: string;

  @Column()
  titulo_medio: string;

  @Column({ type: 'varchar', length: 20, default: 'No' })
  completo_nivel_superior: string;

  @Column({ nullable: true })
  carrera_superior: string;

  @Column({ nullable: true })
  institucion_superior: string;

  @Column({ nullable: true })
  provincia_superior: string;

  @Column({ nullable: true, name: 'año_ingreso_superior' })
  anio_ingreso_superior: number;

  @Column({ nullable: true, name: 'año_egreso_superior' })
  anio_egreso_superior: number;

  // Trabajo y responsabilidades
  @Column()
  trabajo: boolean;

  @Column({ nullable: true })
  horas_diarias: number;

  @Column({ nullable: true })
  descripcion_trabajo: string;

  @Column()
  personas_cargo: boolean;

  @OneToMany(() => Preinscripcion, (preinscripcion) => preinscripcion.aspirante)
  preinscripciones: Preinscripcion[];
}
