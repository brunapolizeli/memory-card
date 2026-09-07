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

router.post("/add-from-search", authenticate, async (req, res) => {
  const { external_id, name, image_url, tags, rawg_rating } = req.body;

  try {
    let gameResult = await pool.query(
      "SELECT id FROM games WHERE external_id = $1",
      [external_id],
    );

    let gameId;

    if (gameResult.rows.length > 0) {
      gameId = gameResult.rows[0].id;
    } else {
      const newGame = await pool.query(
        "INSERT INTO games (external_id, name, image_url, tags, rawg_rating, source) VALUES ($1, $2, $3, $4, $5, 'rawg') RETURNING id",
        [external_id, name, image_url, tags, rawg_rating],
      );
      gameId = newGame.rows[0].id;
    }

    await pool.query(
      "INSERT INTO user_games (user_id, game_id, status) VALUES ($1, $2, NULL)",
      [req.userId, gameId],
    );

    res.status(201).json({ message: "Game added to library" });
  } catch (error) {
    if (error.code === "23505") {
      if (error.constraint === "unique_user_game") {
        return res.status(409).json({ error: "Game already in your library" });
      }
      return res.status(409).json({ error: "Error adding game to catalog" });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to add game to library" });
  }
});

export default router;
