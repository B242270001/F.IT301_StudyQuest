// TASK-01: Authentication — register / login (JWT Bearer) / logout / me
import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createSession,
  createUser,
  deleteSession,
  findUserByUsername,
  toPublicUser,
  verifyPassword,
} from "../store/users.js";
import { validateCreateUser, validateLogin } from "../validators/user.js";

export const authRouter = Router();

function authResponse(token, user) {
  const safe = toPublicUser(user);
  return {
    token,
    tokenType: "Bearer",
    user: {
      id: safe.id,
      username: safe.username,
      displayName: safe.displayName,
      role: safe.role,
    },
  };
}

// Lab 6: Бүртгүүлэх. Өөрөө бүртгүүлэхэд үргэлж STUDENT эрх олгоно —
// TEACHER эрхийг зөвхөн багш (POST /api/users) өгнө.
authRouter.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const { error, value } = validateCreateUser({ ...req.body, role: "STUDENT" });
    if (error) {
      return res.status(error.status).json({ message: error.message, field: error.field });
    }
    if (await findUserByUsername(value.username)) {
      return res.status(409).json({ message: "Энэ нэр аль хэдийн бүртгэлтэй байна", field: "username" });
    }

    const user = await createUser({ ...value, role: "STUDENT" });
    const token = await createSession(user);
    res.status(201).json(authResponse(token, user));
  }),
);

authRouter.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const { error, value } = validateLogin(req.body);
    if (error) {
      return res.status(error.status).json({ message: error.message, field: error.field });
    }

    const user = await findUserByUsername(value.username, { withPassword: true });
    if (!user || !verifyPassword(value.password, user.passwordHash)) {
      return res.status(401).json({ message: "Нэр эсвэл нууц үг буруу байна" });
    }

    const token = await createSession(user);
    res.status(200).json(authResponse(token, user));
  }),
);

// Token-ийг серверээс хүчингүй болгоно (MongoDB-ийн Session-ээс jti-г устгана).
authRouter.post(
  "/auth/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    await deleteSession(req.auth.jti);
    res.status(204).end();
  }),
);

authRouter.get("/auth/me", requireAuth, (req, res) => {
  res.status(200).json(toPublicUser(req.user));
});
