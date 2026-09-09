import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db/pool.js";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";
const saltRounds = 12;

router.get("/me", authenticate, (req, res) => {
  res.json({ userId: req.userId });
});

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, passwordHash],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      if (error.constraint === "users_email_key") {
        return res.status(409).json({ error: "Email already registered" });
      }
      if (error.constraint === "users_username_key") {
        return res.status(409).json({ error: "Username already taken" });
      }
    }
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "SELECT id, username, email, password_hash FROM users WHERE email = $1",
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
