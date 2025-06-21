import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Carrera } from '../carrera/carrera.entity';

@Entity()
export class Requisito {
  @PrimaryGeneratedColumn()
  id_requisito: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: false })
  obligatorio: boolean;

  @ManyToOne(() => Carrera, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_carrera' })
  solo_para_carrera: Carrera | null;
}