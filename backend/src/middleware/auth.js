// TASK-01 (Lab 6): Authentication (JWT Bearer) ба role-based authorization middleware.
import { getAuthFromToken } from "../store/users.js";

function readBearer(req) {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

// Нэвтрээгүй, token буруу/хугацаа дууссан, logout хийсэн token → 401
export async function requireAuth(req, res, next) {
  try {
    const token = readBearer(req);
    if (!token) {
      return res.status(401).json({ message: "Нэвтрээгүй байна" });
    }

    const auth = await getAuthFromToken(token);
    if (!auth) {
      return res.status(401).json({ message: "Нэвтрэх хугацаа дууссан эсвэл token буруу байна" });
    }

    req.user = auth.user;
    req.auth = auth.payload; // { sub, role, jti, exp }
    next();
  } catch (err) {
    next(err);
  }
}

// Нэвтэрсэн ч шаардлагатай эрхгүй бол → 403. requireAuth-ийн ДАРАА хэрэглэнэ.
// Эрхийг token-ий role-оос биш MongoDB дээрх одоогийн role-оос шалгана.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Нэвтрээгүй байна" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Энэ үйлдлийг хийх эрх танд байхгүй" });
    }
    next();
  };
}
