import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  computeRank,
  createUser,
  deleteUserCascade,
  findUserById,
  findUserByUsername,
  getAuthFromToken,
  listUsers,
  toPublicUser,
} from "../store/users.js";
import { validateCreateUser } from "../validators/user.js";

export const usersRouter = Router();

usersRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    res.status(200).json(await listUsers());
  }),
);

usersRouter.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }
    res.status(200).json(toPublicUser(user));
  }),
);

usersRouter.post(
  "/users",
  asyncHandler(async (req, res) => {
    const { error, value } = validateCreateUser(req.body);
    if (error) {
      return res.status(error.status).json({ message: error.message, field: error.field });
    }

    // Lab 6: TEACHER эрхтэй хэрэглэгчийг зөвхөн нэвтэрсэн багш үүсгэнэ (эрх дээшлүүлэхээс сэргийлнэ).
    if (value.role === "TEACHER") {
      const [scheme, token] = (req.get("authorization") || "").split(" ");
      const auth = scheme === "Bearer" && token ? await getAuthFromToken(token) : null;
      if (!auth) {
        return res.status(401).json({ message: "Багш үүсгэхийн тулд нэвтэрсэн байх шаардлагатай" });
      }
      if (auth.user.role !== "TEACHER") {
        return res.status(403).json({ message: "Зөвхөн багш TEACHER эрхтэй хэрэглэгч үүсгэнэ" });
      }
    }

    if (await findUserByUsername(value.username)) {
      return res.status(422).json({
        message: "Энэ нэр аль хэдийн бүртгэлтэй байна",
        field: "username",
      });
    }

    const user = await createUser(value);
    res.status(201).json(toPublicUser(user));
  }),
);

// Lab 6 role-based authorization: хэрэглэгч устгахыг зөвхөн TEACHER хийнэ.
// Нэвтрээгүй → 401, STUDENT → 403, өөрийгөө → 422, байхгүй id → 404.
usersRouter.delete(
  "/users/:id",
  requireAuth,
  requireRole("TEACHER"),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id) {
      return res.status(422).json({ message: "Өөрийгөө устгах боломжгүй", field: "id" });
    }
    const removed = await deleteUserCascade(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
    }
    res.status(204).end();
  }),
);

usersRouter.get(
  "/user/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      ...toPublicUser(req.user),
      rank: await computeRank(req.user),
    });
  }),
);
