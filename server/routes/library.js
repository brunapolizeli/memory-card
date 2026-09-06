import express from "express";
import { pool } from "../db/pool.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/currently-playing", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT games.name, games.image_url, user_games.status, user_games.platform, user_games.hours_played, user_games.user_rating, games.rawg_rating
             FROM user_games 
             JOIN games ON user_games.game_id = games.id
             WHERE user_games.user_id = $1 AND user_games.status IN ('Playing', 'Replaying', 'On Hold')`,
      [req.userId],
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch currently playing games" });
  }
});

export default router;
