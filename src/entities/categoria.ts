import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Categorias")
export class Categoria {
  @PrimaryGeneratedColumn({ name: "id_categoria" })
  idCategoria: number;

  @Column({ name: "nombre", type: "varchar", length: 100 })
  nombre: string;

  @Column({ name: "descripcion", type: "varchar", length: 250, nullable: true })
  descripcion?: string | null;

  @CreateDateColumn({ name: "fecha_creacion", type: "datetime" })
  fechaCreacion: Date;

  @Column({ name: "estado", type: "tinyint", default: true })
  estado: boolean;
}
