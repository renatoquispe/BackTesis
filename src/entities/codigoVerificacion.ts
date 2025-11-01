import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("CodigosVerificacion")
export class CodigoVerificacion {
    @PrimaryGeneratedColumn({ name: "id_codigo" })
    idCodigo!: number;

    @Column({ name: "correo", type: "varchar", length: 100 })
    correo!: string;

    @Column({ name: "codigo", type: "varchar", length: 6 })
    codigo!: string;

    @Column({ 
        name: "tipo", 
        type: "enum", 
        enum: ["RECUPERACION_CONTRASENA", "VERIFICACION_EMAIL", "AUTENTICACION_DOS_FACTORES"] 
    })
    tipo!: string;

    @Column({ name: "fecha_expiracion", type: "datetime" })
    fechaExpiracion!: Date;

    @Column({ name: "usado", type: "tinyint", default: 0 })
    usado!: number;

    @CreateDateColumn({ name: "fecha_creacion", type: "datetime" })
    fechaCreacion!: Date;
}