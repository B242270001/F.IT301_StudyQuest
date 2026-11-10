import { Router } from "express";
import { createSession, findUserByUsername, toPublicUser } from "../store/users.js";
import { validateLogin } from "../validators/user.js";

export const authRouter = Router();

authRouter.post("/auth/login", (req, res) => {
  const { error, value } = validateLogin(req.body);
  if (error) {
    return res.status(error.status).json({ message: error.message, field: error.field });
  }

  const user = findUserByUsername(value.username);
  if (!user || user.password !== value.password) {
    return res.status(401).json({ message: "Нэр эсвэл нууц bnooooo үг буруу байна" });
  }

  const token = createSession(user);
  const safe = toPublicUser(user);
  res.status(200).json({
    token,
    user: {
      id: safe.id,
      displayName: safe.displayName,
      role: safe.role,
    },
  });
});
