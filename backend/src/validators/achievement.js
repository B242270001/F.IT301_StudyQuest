// TASK-06 (Lab 4): Achievement (тэмдэг) — request body validation.
// Алдаа бүр 422 + `{ message, field }` хэлбэртэй (багийн нийтлэг гэрээ, docs/04-api-pages.md §2).

export const ACHIEVEMENT_TYPES = ["XP_TOTAL", "STREAK", "WEEKLY_RANK"];
export const CODE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Төрөл бүрийн босгын (threshold) зөвшөөрөгдөх хүрээ
export const THRESHOLD_RANGE = {
  XP_TOTAL: [1, 1_000_000],
  STREAK: [1, 365],
  WEEKLY_RANK: [1, 50],
};
export const XP_REWARD_MAX = 1000;

const fail = (field, message) => ({ error: { status: 422, field, message } });

const text = (value) => (typeof value === "string" ? value.trim() : "");

// JSON-оос ирсэн "50" зэрэг тоон мөрийг ч хүлээн авна; бусад нь NaN.
function toInteger(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

/**
 * Бүтэн achievement объектыг шалгана. PUT үед route нь одоогийн утга + body-г нэгтгэж дамжуулна,
 * тиймээс хэсэгчилсэн засвар ч эцсийн төлөвөөрөө шалгагдана.
 */
export function validateAchievement(body = {}) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return fail("body", "JSON объект илгээнэ үү");
  }

  const code = text(body.code).toLowerCase();
  if (!code) return fail("code", "Тэмдгийн код оруулна уу");
  if (code.length < 3 || code.length > 40 || !CODE_PATTERN.test(code)) {
    return fail("code", "Код 3–40 тэмдэгт, зөвхөн латин жижиг үсэг, тоо, зураас (-) байна");
  }

  const title = text(body.title);
  if (!title) return fail("title", "Тэмдгийн нэр оруулна уу");
  if (title.length < 2 || title.length > 60) {
    return fail("title", "Нэр 2–60 тэмдэгт байна");
  }

  const description = body.description === undefined ? "" : text(body.description);
  if (typeof body.description !== "undefined" && typeof body.description !== "string") {
    return fail("description", "Тайлбар текст байна");
  }
  if (description.length > 200) return fail("description", "Тайлбар 200 тэмдэгтээс хэтрэхгүй");

  const icon = body.icon === undefined || body.icon === "" ? "🏅" : text(body.icon);
  if (!icon || [...icon].length > 4) return fail("icon", "Дүрс 1–4 тэмдэгт (emoji) байна");

  const type = text(body.type).toUpperCase();
  if (!ACHIEVEMENT_TYPES.includes(type)) {
    return fail("type", `Төрөл нь ${ACHIEVEMENT_TYPES.join(", ")}-ийн аль нэг байна`);
  }

  const threshold = toInteger(body.threshold);
  const [min, max] = THRESHOLD_RANGE[type];
  if (!Number.isInteger(threshold) || threshold < min || threshold > max) {
    return fail("threshold", `Босго ${min}–${max} хооронд бүхэл тоо байна`);
  }

  const xpReward = body.xpReward === undefined ? 0 : toInteger(body.xpReward);
  if (!Number.isInteger(xpReward) || xpReward < 0 || xpReward > XP_REWARD_MAX) {
    return fail("xpReward", `Шагналын XP 0–${XP_REWARD_MAX} хооронд бүхэл тоо байна`);
  }

  return { value: { code, title, description, icon, type, threshold, xpReward } };
}

// GET /api/achievements?type= шүүлтүүр
export function validateTypeFilter(type) {
  if (type === undefined || type === "") return { value: null };
  const upper = String(type).toUpperCase();
  if (!ACHIEVEMENT_TYPES.includes(upper)) {
    return fail("type", `type нь ${ACHIEVEMENT_TYPES.join(", ")}-ийн аль нэг байна`);
  }
  return { value: upper };
}
