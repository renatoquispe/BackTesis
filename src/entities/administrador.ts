import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("Administradores")
export class Administrador {
  @PrimaryGeneratedColumn({ name: "id_admin" })
  idAdmin: number;

  @Column({ name: "usuario", type: "varchar", length: 100, unique: true })
  usuario: string;

  @Column({ name: "correo", type: "varchar", length: 150, unique: true })
  correo: string;

  @Column({ name: "contrasena", type: "varchar", length: 255 })
  contrasena: string;

  @Column({ name: "nombre", type: "varchar", length: 200 })
  nombre: string;

  @Column({ name: "rol", type: "varchar", length: 50, default: "ADMIN" })
  rol: string;

  @CreateDateColumn({ name: "fecha_creacion", type: "datetime" })
  fechaCreacion: Date;

  @Column({ name: "estado", type: "bit", default: true })
  estado: boolean;
}
