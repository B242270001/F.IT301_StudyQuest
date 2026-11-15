import { Router } from "express";
import {
  computeRank,
  createUser,
  findUserById,
  findUserByUsername,
  listUsers,
  toPublicUser,
} from "../store/users.js";
import { validateCreateUser } from "../validators/user.js";
import { requireAuth } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.get("/users", (_req, res) => {
  res.status(200).json(listUsers());
});

usersRouter.get("/users/:id", (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "Хэрэглэгч олдсонгүй" });
  }
  res.status(200).json(toPublicUser(user));
});

usersRouter.post("/users", (req, res) => {
  const { error, value } = validateCreateUser(req.body);
  if (error) {
    return res.status(error.status).json({ message: error.message, field: error.field });
  }

  if (findUserByUsername(value.username)) {
    return res.status(422).json({
      message: "Энэ нэр аль хэдийн бүртгэлтэй байна",
      field: "username",
    });
  }

  const user = createUser(value);
  res.status(201).json(toPublicUser(user));
});

usersRouter.get("/user/profile", requireAuth, (req, res) => {
  const publicUser = toPublicUser(req.user);
  res.status(200).json({
    ...publicUser,
    rank: computeRank(req.user),
  });
});
