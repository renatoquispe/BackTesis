import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Negocio } from "./negocio";

@Entity("DocumentosVerificacion")
export class DocumentoVerificacion {
  @PrimaryGeneratedColumn({ name: "id_documento" })
  idDocumento: number;

  @ManyToOne(() => Negocio, { nullable: false })
  @JoinColumn({ name: "id_negocio" })
  negocio: Negocio;

  @Column({ name: "tipo_documento", type: "varchar", length: 100 })
  tipoDocumento: string;

  @Column({ name: "url_documento", type: "varchar", length: 500 })
  urlDocumento: string;

  @CreateDateColumn({ name: "fecha_subida", type: "datetime" })
  fechaSubida: Date;

  @Column({ name: "estado_verificacion", type: "varchar", length: 50, default: () => "'Pendiente'" })
  estadoVerificacion: string;
}
