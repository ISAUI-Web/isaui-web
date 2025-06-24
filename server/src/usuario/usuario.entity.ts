import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre_usuario: string;

  @Column({ unique: true })
  correo: string;

  @Column()
  contraseña_hash: string;

  @Column()
  rol: string; // Ejemplo: "admin", "moderador", etc.
}
