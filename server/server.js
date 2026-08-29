import express from "express";
import cors from "cors";
import { pool } from "./db/pool.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import gamesRouter from "./routes/games.js";

const app = express();
const PORT = 3000;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/games", gamesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
