import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "tag_task";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer("task_id")
        .unsigned()
        .references("id")
        .inTable("tasks")
        .onDelete("CASCADE");

      table
        .integer("tag_id")
        .unsigned()
        .references("id")
        .inTable("tags")
        .onDelete("CASCADE");

      table.primary(["task_id", "tag_id"]);

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
