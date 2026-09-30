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
  pgm.sql(
    `CREATE OR REPLACE FUNCTION update_hours_minutes()
         RETURNS TRIGGER AS $$
         BEGIN
            UPDATE user_games
            SET hours_played = (SELECT SUM(total_playtime) FROM user_game_platforms WHERE user_game_id = COALESCE(NEW.user_game_id, OLD.user_game_id)) / 60,
                minutes_played = (SELECT SUM(total_playtime) FROM user_game_platforms WHERE user_game_id = COALESCE(NEW.user_game_id, OLD.user_game_id)) % 60
            WHERE id = COALESCE(NEW.user_game_id, OLD.user_game_id);
            
            RETURN COALESCE(NEW, OLD);
         END;
         $$ LANGUAGE plpgsql;
         
         CREATE TRIGGER trigger_update_hours_minutes_insert
         AFTER INSERT ON user_game_platforms
         FOR EACH ROW
         EXECUTE FUNCTION update_hours_minutes();
         
         CREATE TRIGGER trigger_update_hours_minutes_update
         AFTER UPDATE ON user_game_platforms
         FOR EACH ROW
         EXECUTE FUNCTION update_hours_minutes();

         CREATE TRIGGER trigger_update_hours_minutes_delete
         AFTER DELETE ON user_game_platforms
         FOR EACH ROW
         EXECUTE FUNCTION update_hours_minutes();`,
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(
    `DROP TRIGGER IF EXISTS trigger_update_hours_minutes_insert ON user_game_platforms;
       DROP TRIGGER IF EXISTS trigger_update_hours_minutes_update ON user_game_platforms;
       DROP TRIGGER IF EXISTS trigger_update_hours_minutes_delete ON user_game_platforms;
       DROP FUNCTION IF EXISTS update_hours_minutes();`,
  );
};
