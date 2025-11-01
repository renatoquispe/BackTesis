// entities/servicio.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Negocio } from "./negocio";

@Entity("Servicios")
export class Servicio {
  @PrimaryGeneratedColumn({ name: "id_servicio" })
  idServicio!: number;

  @Column({ name: "nombre", type: "varchar", length: 250 })
  nombre!: string;

  // NUEVO: campo descuento
  @Column({ name: "descuento", type: "decimal", precision: 5, scale: 2, nullable: true })
  descuento!: number;

  // CAMBIO: descripcion ahora es imagen_url
  @Column({ name: "imagen_url", type: "varchar", length: 1000, nullable: true })
  imagenUrl!: string;


  @Column({ name: "precio", type: "decimal", precision: 10, scale: 2 })
  precio!: number;

  @Column({ name: "duracion_minutos", type: "int" })
  duracionMinutos!: number;

  @Column({ name: "estado_auditoria", type: "tinyint", default: 1 })
  estadoAuditoria!: boolean;

  @Column({ name: "id_negocio" })
  idNegocio!: number;

  // 👇 Relación con negocio
  @ManyToOne(() => Negocio, (negocio) => negocio.servicios)
  @JoinColumn({ name: "id_negocio" })
  negocio!: Negocio;
}
