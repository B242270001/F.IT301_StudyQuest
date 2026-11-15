import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
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
  return app;
}

export const app = createApp();
