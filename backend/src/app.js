import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authRouter } from "./routes/auth.js";
import { avatarRouter } from "./routes/avatar.js";
import { healthRouter } from "./routes/health.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { notesRouter } from "./routes/notes.js";
import { usersRouter } from "./routes/users.js";

const FRONTEND_DIST = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../dist",
);

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", healthRouter);
  app.use("/api", authRouter);
  app.use("/api", usersRouter);
  app.use("/api", notesRouter);
  app.use("/api", avatarRouter);
  app.use("/api", leaderboardRouter);

  // Frontend build (dist/) байвал нэг порт дээр SPA-г хамт үйлчилнэ.
  // /api-аар эхэлсэн зам энд хүрэхгүй, тодорхойгүй API зам 404 хэвээр буцна.
  if (existsSync(path.join(FRONTEND_DIST, "index.html"))) {
    app.use(express.static(FRONTEND_DIST));
    app.get(/^\/(?!api(\/|$)).*/, (_req, res) => {
      res.sendFile(path.join(FRONTEND_DIST, "index.html"));
    });
  }
  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({ message: "JSON бие буруу байна" });
    }
    return next(err);
  });
  // Mongoose validation / unique index зөрчлийг 422 болгоно, бусад нь 500.
  app.use((err, _req, res, _next) => {
    if (err?.name === "ValidationError") {
      const field = Object.keys(err.errors || {})[0];
      return res.status(422).json({ message: "Оролт буруу байна", field });
    }
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(422).json({ message: "Давхардсан утга байна", field });
    }
    console.error(err);
    return res.status(500).json({ message: "Серверийн алдаа гарлаа" });
  });
  return app;
}

export const app = createApp();
