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
  pgm.addColumn("games", {
    tags: { type: "text[]" },
    rawg_rating: { type: "decimal" },
  });

  pgm.addColumn("user_games", {
    platform: { type: "varchar(50)" },
    hours_played: { type: "decimal" },
    user_rating: { type: "integer", default: null },
    difficulty: { type: "integer", default: null },
    completed: { type: "boolean" },
    completed_date: { type: "date", default: null },
    completed_notes: { type: "text", default: null },
    platinum: { type: "boolean" },
    platinum_date: { type: "date", default: null },
    platinum_notes: { type: "text", default: null },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropColumn("games", ["tags", "rawg_rating"]);

  pgm.dropColumn("user_games", [
    "platform",
    "hours_played",
    "user_rating",
    "difficulty",
    "completed",
    "completed_date",
    "completed_notes",
    "platinum",
    "platinum_date",
    "platinum_notes",
  ]);
};
