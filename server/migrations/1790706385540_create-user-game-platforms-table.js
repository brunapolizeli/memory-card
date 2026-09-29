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
  pgm.createTable(
    "user_game_platforms",
    {
      id: "id",
      user_game_id: {
        type: "integer",
        notNull: true,
        references: "user_games",
        onDelete: "CASCADE",
      },
      platform: { type: "text", notNull: true },
      hours_played: { type: "integer", notNull: false },
      minutes_played: { type: "integer", notNull: false },
    },
    {
      constraints: {
        unique: ["user_game_id", "platform"],
      },
    },
  );

  pgm.sql(`
    ALTER TABLE user_game_platforms
    ADD COLUMN total_playtime INTEGER
    GENERATED ALWAYS AS (COALESCE(hours_played, 0) * 60 + COALESCE(minutes_played, 0)) STORED;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`ALTER TABLE user_game_platforms DROP COLUMN total_playtime;`);

  pgm.dropTable("user_game_platforms");
};
