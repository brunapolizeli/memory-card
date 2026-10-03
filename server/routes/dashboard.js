import express from "express";
import { pool } from "../db/pool.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/user-stats", authenticate, async (req, res) => {
  try {
    const [statsResult, platformsResult, genresResult] = await Promise.all([
      pool.query(
        `SELECT
                COUNT(*) AS games_tracked,
                COUNT(*) FILTER (
                    WHERE status IN ('finished', 'replaying')
                    OR completed OR platinum
                ) AS games_finished,
                COUNT(*) FILTER (WHERE platinum) AS games_platinumed,
                COUNT(*) FILTER (WHERE status = 'backlog') AS backlog_total,
                COUNT(*) FILTER (WHERE status = 'wishlist') AS wishlist_total,
                COALESCE(SUM(total_playtime), 0) AS playtime_sum,
                AVG(user_rating) AS average_rating
            FROM user_games
            WHERE user_id = $1`,
        [req.userId],
      ),
      pool.query(
        `SELECT user_game_platforms.platform, COUNT(*) AS total
             FROM user_game_platforms
             JOIN user_games ON user_game_platforms.user_game_id = user_games.id
             WHERE user_games.user_id = $1
             GROUP BY user_game_platforms.platform
             ORDER BY total DESC, user_game_platforms.platform
             LIMIT 1`,
        [req.userId],
      ),
      pool.query(
        `SELECT unnest(games.genres) AS genre, COUNT(*) AS total
             FROM games
             JOIN user_games ON games.id = user_games.game_id
             WHERE user_games.user_id = $1
             GROUP BY genre
             ORDER BY total DESC, genre
             LIMIT 1`,
        [req.userId],
      ),
    ]);

    const stats = statsResult.rows[0];
    const playtimeSum = Number(stats.playtime_sum);

    res.json({
      games_tracked: Number(stats.games_tracked),
      games_finished: Number(stats.games_finished),
      games_platinumed: Number(stats.games_platinumed),
      backlog_total: Number(stats.backlog_total),
      wishlist_total: Number(stats.wishlist_total),
      total_hours: Math.floor(playtimeSum / 60),
      total_minutes: playtimeSum % 60,
      average_rating:
        stats.average_rating === null
          ? null
          : Number(Number(stats.average_rating).toFixed(1)),
      top_platform: platformsResult.rows[0]?.platform ?? null,
      favorite_genre: genresResult.rows[0]?.genre ?? null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

router.get("/games-by-platform", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_game_platforms.platform, COUNT(*) AS total
             FROM user_game_platforms
             JOIN user_games ON user_game_platforms.user_game_id = user_games.id
             WHERE user_games.user_id = $1
             GROUP BY user_game_platforms.platform
             ORDER BY total DESC, user_game_platforms.platform`,
      [req.userId],
    );

    const platforms = result.rows.map((row) => ({
      platform: row.platform,
      total: Number(row.total),
    }));

    const grandTotal = platforms.reduce((sum, item) => sum + item.total, 0);

    res.json({ platforms, grandTotal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user platforms" });
  }
});

export default router;
