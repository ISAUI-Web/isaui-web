import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum RolUsuario {
  ADMIN_GENERAL = 'ADMIN_GENERAL',
  GESTOR_ACADEMICO = 'GESTOR_ACADEMICO',
  PROFESOR = 'PROFESOR',
}

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // 🚀 Ahora es único
  nombre_usuario: string;

  @Column()
  contraseña_hash: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
  })
  rol: RolUsuario;
}
