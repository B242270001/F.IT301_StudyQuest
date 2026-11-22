// TASK-01: Хэрэглэгчийн дүр (avatar) — MongoDB дээрх User.avatarConfig.
import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { AVATAR_OPTIONS } from "../models/avatarOptions.js";
import { updateAvatar } from "../store/users.js";
import { validateAvatarConfig } from "../validators/avatar.js";

export const avatarRouter = Router();

avatarRouter.get("/user/avatar", requireAuth, (req, res) => {
  res.status(200).json({
    avatarConfig: req.user.avatarConfig,
    options: AVATAR_OPTIONS,
  });
});

avatarRouter.put(
  "/user/avatar",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { error, value } = validateAvatarConfig(req.body);
    if (error) {
      return res.status(error.status).json({ message: error.message, field: error.field });
    }
    const user = await updateAvatar(req.user, value);
    res.status(200).json({ avatarConfig: user.avatarConfig });
  }),
);
