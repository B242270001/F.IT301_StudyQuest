import { getUserByToken } from "../store/users.js";

export function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Нэвтрээгүй байна" });
  }

  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ message: "Нэвтрээгүй байна" });
  }

  req.user = user;
  next();
}
