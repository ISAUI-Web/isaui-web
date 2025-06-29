import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Carrera {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ name: 'cupo_maximo' })
  cupo_maximo: number;

  @Column({ name: 'cupo_actual' })
  cupo_actual: number;
}
