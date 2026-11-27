// TASK-06 (Lab 4): Achievement (тэмдэг) REST API — list, detail, create, update, delete.
// TASK-06 (Lab 5): MongoDB store + UserAchievement хамаарал (тэмдэг олгох, хэрэглэгчийн тэмдгүүд).
// TASK-06 (Lab 6): Бичих үйлдэл зөвхөн TEACHER (нэвтрээгүй 401, STUDENT 403);
//                  /api/me/achievements — нэвтэрсэн хэрэглэгчийн өөрийн хүрээ (TASK-01-ийн JWT middleware).
import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  awardAchievement,
  claimMyAchievements,
  createAchievement,
  deleteAchievement,
  findAchievement,
  getMyAchievements,
  isCodeTaken,
  listAchievements,
  listUserAchievements,
  updateAchievement,
} from "../store/achievements.js";
import { validateAchievement, validateTypeFilter } from "../validators/achievement.js";

export const achievementsRouter = Router();

// Тэмдэг үүсгэх, засах, устгах, олгох эрх зөвхөн багшид.
const teacherOnly = [requireAuth, requireRole("TEACHER")];

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

// GET /api/achievements/user/:userId → 200 [{ id, awardedAt, achievement }] | 404 (хэрэглэгч байхгүй)
achievementsRouter.get(
  "/achievements/user/:userId",
  asyncHandler(async (req, res) => {
    const awards = await listUserAchievements(req.params.userId);
    if (!awards) return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    res.status(200).json(awards);
  }),
);

// GET /api/achievements/:id → 200 (+ holderCount) | 404
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
  ...teacherOnly,
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
  ...teacherOnly,
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
  ...teacherOnly,
  asyncHandler(async (req, res) => {
    if (!(await deleteAchievement(req.params.id))) return notFound(res);
    res.status(204).end();
  }),
);

// POST /api/achievements/:id/award { userId } → 201 | 404 (тэмдэг) | 422 (userId) | 409 (аль хэдийн авсан)
const AWARD_ERRORS = {
  ACHIEVEMENT_NOT_FOUND: [404, "Тэмдэг олдсонгүй", undefined],
  USER_NOT_FOUND: [422, "Ийм хэрэглэгч олдсонгүй", "userId"],
  ALREADY_AWARDED: [409, "Энэ хэрэглэгч уг тэмдгийг аль хэдийн авсан", "userId"],
};

achievementsRouter.post(
  "/achievements/:id/award",
  ...teacherOnly,
  asyncHandler(async (req, res) => {
    const userId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "";
    if (!userId) {
      return res.status(422).json({ message: "Тэмдэг олгох хэрэглэгчийг сонгоно уу", field: "userId" });
    }
    const { error, value } = await awardAchievement(req.params.id, userId, req.user?._id ?? null);
    if (error) {
      const [status, message, field] = AWARD_ERRORS[error];
      return res.status(status).json({ message, field });
    }
    res.status(201).json(value);
  }),
);

// GET /api/me/achievements → 200 [Achievement + earned + awardedAt + progress] | 401
achievementsRouter.get(
  "/me/achievements",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.status(200).json(await getMyAchievements(req.user));
  }),
);

// POST /api/me/achievements/claim → 200 { awarded, achievements } | 401. Давтан дуудахад awarded = [].
achievementsRouter.post(
  "/me/achievements/claim",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.status(200).json(await claimMyAchievements(req.user));
  }),
);
