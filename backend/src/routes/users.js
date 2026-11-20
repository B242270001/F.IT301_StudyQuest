import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  computeRank,
  createUser,
  findUserById,
  findUserByUsername,
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
