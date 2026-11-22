// Чансаа (TASK-06-ийн хуудас, API-г TASK-01 MongoDB дээр хэрэгжүүлэв — WORK_ALLOCATION.md).
import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getLeaderboard } from "../store/users.js";

export const leaderboardRouter = Router();

const PERIODS = new Set(["weekly", "allTime"]);

leaderboardRouter.get(
  "/leaderboard",
  asyncHandler(async (req, res) => {
    const period = req.query.period || "weekly";
    if (!PERIODS.has(period)) {
      return res.status(422).json({ message: "period нь weekly эсвэл allTime байна", field: "period" });
    }
    res.status(200).json(await getLeaderboard(period));
  }),
);
