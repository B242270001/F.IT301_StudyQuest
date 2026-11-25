// TASK-06 (Lab 4): Achievement (тэмдэг) REST API — list, detail, create, update, delete.
import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  createAchievement,
  deleteAchievement,
  findAchievement,
  isCodeTaken,
  listAchievements,
  updateAchievement,
} from "../store/achievements.js";
import { validateAchievement, validateTypeFilter } from "../validators/achievement.js";

export const achievementsRouter = Router();

const sendError = (res, error) =>
  res.status(error.status).json({ message: error.message, field: error.field });

const notFound = (res) => res.status(404).json({ message: "Тэмдэг олдсонгүй" });

const duplicateCode = (res) =>
  res.status(422).json({ message: "Ийм кодтой тэмдэг аль хэдийн байна", field: "code" });

// GET /api/achievements?type=XP_TOTAL|STREAK|WEEKLY_RANK → 200, буруу type → 422
achievementsRouter.get(
  "/achievements",
  asyncHandler(async (req, res) => {
    const { error, value: type } = validateTypeFilter(req.query.type);
    if (error) return sendError(res, error);
    res.status(200).json(await listAchievements({ type }));
  }),
);

// GET /api/achievements/:id → 200 | 404
achievementsRouter.get(
  "/achievements/:id",
  asyncHandler(async (req, res) => {
    const achievement = await findAchievement(req.params.id);
    if (!achievement) return notFound(res);
    res.status(200).json(achievement);
  }),
);

// POST /api/achievements → 201 + id | 422 (талбарын алдаа, давхардсан код)
achievementsRouter.post(
  "/achievements",
  asyncHandler(async (req, res) => {
    const { error, value } = validateAchievement(req.body);
    if (error) return sendError(res, error);
    if (await isCodeTaken(value.code)) return duplicateCode(res);
    res.status(201).json(await createAchievement(value));
  }),
);

// PUT /api/achievements/:id → 200 | 404 | 422. Ирээгүй талбар одоогийн утгаараа үлдэнэ.
achievementsRouter.put(
  "/achievements/:id",
  asyncHandler(async (req, res) => {
    const current = await findAchievement(req.params.id);
    if (!current) return notFound(res);
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { error, value } = validateAchievement({ ...current, ...body });
    if (error) return sendError(res, error);
    if (await isCodeTaken(value.code, current.id)) return duplicateCode(res);
    res.status(200).json(await updateAchievement(current.id, value));
  }),
);

// DELETE /api/achievements/:id → 204 (body-гүй) | 404
achievementsRouter.delete(
  "/achievements/:id",
  asyncHandler(async (req, res) => {
    if (!(await deleteAchievement(req.params.id))) return notFound(res);
    res.status(204).end();
  }),
);
