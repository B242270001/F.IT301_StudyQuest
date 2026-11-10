import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { usersRouter } from "./routes/users.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", healthRouter);
  app.use("/api", authRouter);
  app.use("/api", usersRouter);
  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({ message: "JSON бие буруу байна" });
    }
    return next(err);
  });
  return app;
}

export const app = createApp();
