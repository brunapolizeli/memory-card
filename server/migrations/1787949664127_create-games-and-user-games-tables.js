/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("games", {
    id: "id",
    external_id: { type: "varchar(50)" },
    source: { type: "varchar(50)", notNull: true },
    name: { type: "varchar(255)", notNull: true },
    image_url: { type: "varchar(500)" },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });

  pgm.createTable("user_games", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    game_id: {
      type: "integer",
      notNull: true,
      references: "games",
      onDelete: "CASCADE",
    },
    status: { type: "varchar(50)", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("user_games");
  pgm.dropTable("games");
};
