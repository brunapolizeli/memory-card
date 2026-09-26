import express from "express";
import { pool } from "../db/pool.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/currently-playing", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT games.name, games.image_url, user_games.status, user_games.platforms, user_games.hours_played, user_games.user_rating, games.rawg_rating
             FROM user_games 
             JOIN games ON user_games.game_id = games.id
             WHERE user_games.user_id = $1 AND user_games.status IN ('playing', 'replaying', 'on-hold')`,
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
      `SELECT id FROM games WHERE external_id = $1`,
      [external_id],
    );

    let gameId;

    if (gameResult.rows.length > 0) {
      gameId = gameResult.rows[0].id;
    } else {
      const newGame = await pool.query(
        `INSERT INTO games (external_id, name, image_url, tags, rawg_rating, source) VALUES ($1, $2, $3, $4, $5, 'rawg') RETURNING id`,
        [external_id, name, image_url, tags, rawg_rating],
      );
      gameId = newGame.rows[0].id;
    }

    await pool.query(
      `INSERT INTO user_games (user_id, game_id, status) VALUES ($1, $2, NULL)`,
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

router.get("/games-list", authenticate, async (req, res) => {
  const { page, statuses, progress, playtime, user_ratings } = req.query;
  const pageSize = 4;
  const offset = (page - 1) * pageSize;

  const statusesArray = statuses
    ? Array.isArray(statuses)
      ? statuses
      : [statuses]
    : undefined;

  const progressArray = progress
    ? Array.isArray(progress)
      ? progress
      : [progress]
    : undefined;

  const playtimeArray = playtime
    ? Array.isArray(playtime)
      ? playtime
      : [playtime]
    : undefined;

  const userRatingsArray = user_ratings
    ? Array.isArray(user_ratings)
      ? user_ratings
      : [user_ratings]
    : undefined;

  let query = `SELECT games.name, games.image_url, games.tags, 
  user_games.id AS user_games_id, user_games.status, 
  user_games.platforms, user_games.hours_played, 
  user_games.user_rating, games.rawg_rating
  FROM user_games
  JOIN games ON user_games.game_id = games.id
  WHERE user_games.user_id = $1`;

  const values = [req.userId];

  if (statusesArray) {
    query += ` AND user_games.status = ANY($${values.length + 1})`;
    values.push(statusesArray);
  }

  if (progressArray) {
    const progressConditions = [];

    if (progressArray.includes("completed")) {
      progressConditions.push("user_games.completed = true");
    }

    if (progressArray.includes("platinum")) {
      progressConditions.push("user_games.platinum = true");
    }

    if (progressConditions.length > 0) {
      query += ` AND (${progressConditions.join(" OR ")})`;
    }
  }

  if (playtimeArray) {
    const playtimeConditions = [];

    if (playtimeArray.includes("0-10h")) {
      playtimeConditions.push(
        "user_games.total_playtime BETWEEN 0 AND 10 * 60",
      );
    }

    if (playtimeArray.includes("10-25h")) {
      playtimeConditions.push(
        "user_games.total_playtime BETWEEN 10 * 60 AND 25 * 60",
      );
    }

    if (playtimeArray.includes("25-50h")) {
      playtimeConditions.push(
        "user_games.total_playtime BETWEEN 25 * 60 AND 50 * 60",
      );
    }

    if (playtimeArray.includes("50-100h")) {
      playtimeConditions.push(
        "user_games.total_playtime BETWEEN 50 * 60 AND 100 * 60",
      );
    }

    if (playtimeArray.includes("100-250h")) {
      playtimeConditions.push(
        "user_games.total_playtime BETWEEN 100 * 60 AND 250 * 60",
      );
    }

    if (playtimeArray.includes("250h+")) {
      playtimeConditions.push("user_games.total_playtime > 250 * 60");
    }

    if (playtimeConditions.length > 0) {
      query += ` AND (${playtimeConditions.join(" OR ")})`;
    }
  }

  if (userRatingsArray) {
    const ratingConditions = [];

    const numericRatings = userRatingsArray.filter(
      (rating) => rating !== "not-rated",
    );

    if (numericRatings.length > 0) {
      ratingConditions.push(
        `user_games.user_rating = ANY($${values.length + 1})`,
      );
      values.push(numericRatings);
    }

    if (userRatingsArray.includes("not-rated")) {
      ratingConditions.push("user_games.user_rating IS NULL");
    }

    if (ratingConditions.length > 0) {
      query += ` AND (${ratingConditions.join(" OR ")})`;
    }
  }

  query += ` ORDER BY user_games.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(pageSize, offset);

  try {
    const result = await pool.query(query, values);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM user_games WHERE user_id = $1`,
      [req.userId],
    );

    res.json({
      results: result.rows,
      count: Number(countResult.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch library" });
  }
});

router.delete("/remove-game", authenticate, async (req, res) => {
  const { id } = req.body;

  try {
    const result = await pool.query(
      `DELETE FROM user_games WHERE id = $1 AND user_id = $2`,
      [id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found in your library" });
    }

    res.status(200).json({ message: "Game removed from your library" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove game from library" });
  }
});

router.get("/game-details", authenticate, async (req, res) => {
  const { id } = req.query;

  try {
    const result = await pool.query(
      `SELECT games.name, games.image_url, games.tags, games.rawg_rating, user_games.*
      FROM user_games
      JOIN games ON user_games.game_id = games.id
      WHERE user_games.id = $1 AND user_games.user_id = $2`,
      [id, req.userId],
    );

    const game = result.rows[0];

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

router.patch("/update-progress", authenticate, async (req, res) => {
  const { id, started, completed, platinum } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET started = $1, completed = $2, platinum = $3
      WHERE id = $4 AND user_id = $5`,
      [started, completed, platinum, id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Progress updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game progress" });
  }
});

router.patch("/update-status", authenticate, async (req, res) => {
  const { id, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET status = $1
      WHERE id = $2 AND user_id = $3`,
      [status, id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game status" });
  }
});

router.patch("/update-platforms", authenticate, async (req, res) => {
  const { id, platforms } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET platforms = $1
      WHERE id = $2 AND user_id = $3`,
      [platforms, id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Platforms updated sucessfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game platforms" });
  }
});

router.patch("/update-hours-played", authenticate, async (req, res) => {
  const { id, hours_played } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET hours_played = $1
      WHERE id = $2 AND user_id = $3`,
      [hours_played, id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Playtime updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game playtime" });
  }
});

router.patch("/update-minutes-played", authenticate, async (req, res) => {
  const { id, minutes_played } = req.body;

  if (minutes_played > 59) {
    return res
      .status(400)
      .json({ error: "Minutes played field must not exceed 59" });
  }

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET minutes_played = $1
      WHERE id = $2 AND user_id = $3`,
      [minutes_played, id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Playtime updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game playtime" });
  }
});

router.patch("/update-user-rating", authenticate, async (req, res) => {
  const { id, value } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET user_rating = $1
      WHERE id = $2 AND user_id = $3`,
      [value, id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "User rating updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game user rating" });
  }
});

router.patch("/update-difficulty", authenticate, async (req, res) => {
  const { id, value } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET difficulty = $1
      WHERE id = $2 AND user_id = $3`,
      [value, id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Difficulty updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game difficulty" });
  }
});

router.patch("/update-start-date", authenticate, async (req, res) => {
  const { id, date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET start_date = $1
      WHERE id = $2 AND user_id = $3`,
      [date, id, req.userId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Start date updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game start date" });
  }
});

router.patch("/update-completed-date", authenticate, async (req, res) => {
  const { id, date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET completed_date = $1
      WHERE id = $2 AND user_id = $3`,
      [date, id, req.userId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Completed date updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game completed date" });
  }
});

router.patch("/update-platinum-date", authenticate, async (req, res) => {
  const { id, date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET platinum_date = $1
      WHERE id = $2 AND user_id = $3`,
      [date, id, req.userId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Platinum date updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game platinum date" });
  }
});

router.patch("/update-completed-notes", authenticate, async (req, res) => {
  const { id, note } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET completed_notes = $1
      WHERE id = $2 AND user_id = $3`,
      [note, id, req.userId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Completed notes updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game completed notes" });
  }
});

router.patch("/update-platinum-notes", authenticate, async (req, res) => {
  const { id, note } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET platinum_notes = $1
      WHERE id = $2 AND user_id = $3`,
      [note, id, req.userId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Platinum notes updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game platinum notes" });
  }
});

router.patch("/update-game-modes", authenticate, async (req, res) => {
  const { id, modes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_games
      SET game_modes = $1
      WHERE id = $2 AND user_id = $3`,
      [modes, id, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Game modes updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update game modes" });
  }
});

router.get("/user-platforms", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT platform
       FROM user_games
       CROSS JOIN LATERAL unnest(platforms) AS platform
       WHERE user_id = $1
       AND platforms IS NOT NULL`,
      [req.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve user platforms" });
  }
});

export default router;
