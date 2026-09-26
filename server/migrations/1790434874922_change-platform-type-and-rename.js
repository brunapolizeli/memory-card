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
  pgm.sql(`
    ALTER TABLE user_games
    ALTER COLUMN platform TYPE text[]
    USING CASE WHEN platform IS NULL THEN NULL ELSE ARRAY[platform] END;
  `);

  pgm.renameColumn("user_games", "platform", "platforms");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.renameColumn("user_games", "platforms", "platform");

  pgm.sql(`
    ALTER TABLE user_games
    ALTER COLUMN platform TYPE text
    USING platform[1];
  `);
};
