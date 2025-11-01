import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Negocio } from "./negocio";

@Entity("Horarios")
export class Horario {
  @PrimaryGeneratedColumn({ name: "id_horario" })
  idHorario: number;

  @ManyToOne(() => Negocio, { nullable: false })
  @JoinColumn({ name: "id_negocio" })
  negocio: Negocio;

  @Column({ name: "dia_semana", type: "varchar", length: 20 })
  diaSemana: string;

  @Column({ name: "hora_apertura", type: "time" })
  horaApertura: string; // TIME se maneja como string en TypeORM

  @Column({ name: "hora_cierre", type: "time" })
  horaCierre: string;

  @Column({ name: "estado_auditoria", type: "tinyint", default: true })
  estado: boolean;
}
