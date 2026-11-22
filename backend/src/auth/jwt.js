// TASK-01 (Lab 6): JWT үүсгэх / шалгах.
// Token нь { sub: userId, role, jti } агуулна. jti нь MongoDB-ийн Session-д хадгалагдах тул
// logout хийхэд тухайн token-ийг серверээс хүчингүй болгож чадна.
import jwt from "jsonwebtoken";

const DEV_SECRET = "studyquest-dev-only-secret-change-me";
let warned = false;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET орчны хувьсагч production орчинд заавал шаардлагатай");
  }
  if (!warned && process.env.NODE_ENV !== "test") {
    console.warn("⚠️  JWT_SECRET тохируулаагүй тул хөгжүүлэлтийн түр түлхүүр ашиглаж байна");
    warned = true;
  }
  return DEV_SECRET;
}

export function signToken({ userId, role, jti }) {
  return jwt.sign({ sub: userId, role, jti }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: "studyquest",
  });
}

// Хүчингүй, хугацаа дууссан, гарын үсэг буруу бол null буцаана.
export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret(), { issuer: "studyquest" });
  } catch {
    return null;
  }
}
