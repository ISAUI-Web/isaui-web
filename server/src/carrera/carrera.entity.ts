import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Carrera {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ name: 'cupo_maximo' })
  cupoMaximo: number;

  @Column({ name: 'cupo_actual' })
  cupoActual: number;
}
