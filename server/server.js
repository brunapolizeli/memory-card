import express from "express";
import cors from "cors";
import { pool } from "./db/pool.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import gamesRouter from "./routes/games.js";
import libraryRouter from "./routes/library.js";

const app = express();
const PORT = 3000;
const allowedOrigins = process.env.FRONTEND_URL.split(",");

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/games", gamesRouter);
app.use("/library", libraryRouter);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
