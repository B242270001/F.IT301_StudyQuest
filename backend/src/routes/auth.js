import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  createSession,
  deleteSession,
  findUserByUsername,
  toPublicUser,
  verifyPassword,
} from "../store/users.js";
import { validateLogin } from "../validators/user.js";

export const authRouter = Router();

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
    const safe = toPublicUser(user);
    res.status(200).json({
      token,
      user: {
        id: safe.id,
        displayName: safe.displayName,
        role: safe.role,
      },
    });
  }),
);

authRouter.post(
  "/auth/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    await deleteSession(req.token);
    res.status(204).end();
  }),
);
