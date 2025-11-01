import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Negocio } from "./negocio";
import { OneToOne } from "typeorm";


@Entity("Usuarios")
export class Usuario {
    
    @PrimaryGeneratedColumn({ name: "id_usuario" })
    idUsuario!: number;

    @Column({ name: "nombre", type: "varchar", length: 250, nullable: true })
    nombre!: string;

    @Column({ name: "apellido_paterno", type: "varchar", length: 250, nullable: true })
    apellidoPaterno!: string;

    @Column({ name: "apellido_materno", type: "varchar", length: 250, nullable: true })
    apellidoMaterno!: string;

    @Column({ name: "correo", type: "varchar", length: 100, unique: true })
    correo!: string;

    @Column({ name: "contrasena", type: "varchar", length: 256 })
    contrasena!: string;

    @Column({ name: "fecha_nacimiento", type: "date", nullable: true })
    fechaNacimiento!: Date;

    @Column({ name: "foto_perfil", type: "varchar", length: 1000, nullable: true })
    fotoPerfil!: string;

    @CreateDateColumn({ name: "fecha_creacion", type: "datetime" })
    fechaCreacion!: Date;

    @Column({ name: "estado_auditoria", type: "tinyint", default: () => "0" })
    estadoAuditoria!: number;

    @OneToOne(() => Negocio, (n) => n.usuario) // 👈 uno a uno
  negocio!: Negocio;

}
