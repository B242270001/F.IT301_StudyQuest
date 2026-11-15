/**
 * TASK-01 (эзэмшил) — backend/src/middleware/auth.js
 * JWT auth middleware — TASK-04 болон бусад модулиуд ашиглана.
 *
 * Lab 4 горимд тусгай token байхгүй бол mock user ашиглана.
 * Lab 5-д бодит JWT шалгалт нэмэгдэнэ.
 */

const MOCK_USERS = {
  "mock-teacher-token": {
    id: "U06",
    displayName: "Багш Дорж",
    role: "TEACHER",
  },
  "mock-student-token": {
    id: "U01",
    displayName: "А. Саруул",
    role: "STUDENT",
  },
};

/**
 * requireAuth — Хэрэглэгч нэвтэрсэн эсэхийг шалгана.
 * Authorization: Bearer <token> header шаардана.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ message: "Нэвтэрч орно уу" });
  }

  // Mock token шалгалт
  const user = MOCK_USERS[token];
  if (!user) {
    return res.status(401).json({ message: "Токен хүчингүй" });
  }

  req.user = user;
  next();
}

/**
 * requireTeacher — Зөвхөн TEACHER role-д зөвшөөрнө.
 * requireAuth-ийн дараа ашиглах ёстой.
 */
function requireTeacher(req, res, next) {
  if (!req.user || req.user.role !== "TEACHER") {
    return res.status(403).json({ message: "Зөвхөн багш хандах боломжтой" });
  }
  next();
}

module.exports = { requireAuth, requireTeacher };
