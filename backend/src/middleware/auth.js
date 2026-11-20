import { getUserByToken } from "../store/users.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.get("authorization") || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Нэвтрээгүй байна" });
    }

    const user = await getUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: "Нэвтрээгүй байна" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}
