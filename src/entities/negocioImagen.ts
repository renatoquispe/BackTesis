import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Negocio } from "./negocio";

@Entity("NegocioImagenes")
export class NegocioImagen {
  @PrimaryGeneratedColumn({ name: "id_imagen" })
  idImagen: number;

  @ManyToOne(() => Negocio, { nullable: false })
  @JoinColumn({ name: "id_negocio" })
  negocio: Negocio;

  @Column({ name: "url_imagen", type: "varchar", length: 500 })
  urlImagen: string;

  @Column({ name: "descripcion", type: "varchar", length: 250, nullable: true })
  descripcion?: string | null;

  @CreateDateColumn({ name: "fecha_subida", type: "datetime" })
  fechaSubida: Date;

  @Column({ name: "estado", type: "tinyint", default: true })
  estado: boolean;
}
