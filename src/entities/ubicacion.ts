import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Ubicaciones")
export class Ubicacion {
  @PrimaryGeneratedColumn({ name: "id_ubicacion" })
  idUbicacion: number;

  @Column({ name: "ciudad", type: "varchar", length: 100 })
  ciudad: string;

  @Column({ name: "distrito", type: "varchar", length: 100 })
  distrito: string;

  
}
