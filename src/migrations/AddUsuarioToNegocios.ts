    // src/migrations/AddUsuarioToNegocios.ts
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from "typeorm";

export class AddUsuarioToNegocios implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableName = "Negocios";
    const fkName = "fk_negocios_usuario";
    const idxName = "idx_negocios_id_usuario";

    // 1) Columna (nullable)
    const hasCol = await queryRunner.hasColumn(tableName, "id_usuario");
    if (!hasCol) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({ name: "id_usuario", type: "int", isNullable: true })
      );
    }

    // Relee metadatos
    const table = await queryRunner.getTable(tableName);

    // 2) Índice
    if (!table?.indices.some(i => i.name === idxName)) {
      await queryRunner.createIndex(
        tableName,
        new TableIndex({ name: idxName, columnNames: ["id_usuario"] })
      );
    }

    // 3) FK
    if (!table?.foreignKeys.some(fk => fk.name === fkName)) {
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          name: fkName,
          columnNames: ["id_usuario"],
          referencedTableName: "Usuarios",
          referencedColumnNames: ["id_usuario"],
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableName = "Negocios";
    const fkName = "fk_negocios_usuario";
    const idxName = "idx_negocios_id_usuario";

    const table = await queryRunner.getTable(tableName);

    const fk = table?.foreignKeys.find(f => f.name === fkName);
    if (fk) await queryRunner.dropForeignKey(tableName, fk);

    const idx = table?.indices.find(i => i.name === idxName);
    if (idx) await queryRunner.dropIndex(tableName, idx);

    const hasCol = await queryRunner.hasColumn(tableName, "id_usuario");
    if (hasCol) await queryRunner.dropColumn(tableName, "id_usuario");
  }
}
