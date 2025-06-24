import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
  lugar_nacimiento: string;

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

  @Column()
  año_ingreso_medio: number;

  @Column()
  año_egreso_medio: number;

  @Column()
  provincia_medio: string;

  @Column()
  titulo_medio: string;

  // Nivel superior
  @Column()
  completo_nivel_superior: boolean;

  @Column({ nullable: true })
  carrera_superior: string;

  @Column({ nullable: true })
  institucion_superior: string;

  @Column({ nullable: true })
  provincia_superior: string;

  @Column({ nullable: true })
  año_ingreso_superior: number;

  @Column({ nullable: true })
  año_egreso_superior: number;

  // Trabajo y responsabilidades
  @Column()
  trabajo: boolean;

  @Column({ nullable: true })
  descripcion_trabajo: string;

  @Column()
  personas_cargo: boolean;
}
