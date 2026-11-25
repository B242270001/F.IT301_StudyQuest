// TASK-06 (Lab 5): Тэмдгийн маягтын frontend validation — backend/src/validators/achievement.js-тэй ижил дүрэм.
// Сервер мөн давтан шалгана; энд хэрэглэгчид хүсэлт илгээхээс өмнө ойлгомжтой алдаа харуулна.

export const ACHIEVEMENT_TYPES = [
  { value: "XP_TOTAL", label: "Нийт XP", unit: "XP", min: 1, max: 1_000_000 },
  { value: "STREAK", label: "Дараалсан өдөр", unit: "өдөр", min: 1, max: 365 },
  { value: "WEEKLY_RANK", label: "Долоо хоногийн байр", unit: "-р байр хүртэл", min: 1, max: 50 },
];

export const EMPTY_ACHIEVEMENT = {
  code: "",
  title: "",
  description: "",
  icon: "🏅",
  type: "XP_TOTAL",
  threshold: "",
  xpReward: "0",
};

const CODE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const typeInfo = (type) => ACHIEVEMENT_TYPES.find((t) => t.value === type) || ACHIEVEMENT_TYPES[0];

// "XP_TOTAL, 2500" → "Нийт XP: 2,500 XP"
export function describeGoal({ type, threshold }) {
  const info = typeInfo(type);
  const value = Number(threshold).toLocaleString("en-US");
  return type === "WEEKLY_RANK" ? `${info.label}: ${value}${info.unit}` : `${info.label}: ${value} ${info.unit}`;
}

// Код хоосон бол давтагдахгүй код үүсгэнэ (монгол нэрээс латин код гаргах боломжгүй тул).
export const generateCode = (now = Date.now()) => `badge-${now.toString(36)}`;

/** @returns {{ errors: Record<string,string>, value: object|null }} */
export function validateAchievementForm(form) {
  const errors = {};
  const code = form.code.trim().toLowerCase();
  const title = form.title.trim();
  const description = form.description.trim();
  const icon = form.icon.trim() || "🏅";
  const info = typeInfo(form.type);
  const threshold = Number(form.threshold);
  const xpReward = form.xpReward === "" ? 0 : Number(form.xpReward);

  if (code && (code.length < 3 || code.length > 40 || !CODE_PATTERN.test(code))) {
    errors.code = "Код 3–40 тэмдэгт, латин жижиг үсэг, тоо, зураас (-) байна";
  }
  if (!title) errors.title = "Тэмдгийн нэр оруулна уу";
  else if (title.length < 2 || title.length > 60) errors.title = "Нэр 2–60 тэмдэгт байна";
  if (description.length > 200) errors.description = "Тайлбар 200 тэмдэгтээс хэтрэхгүй";
  if ([...icon].length > 4) errors.icon = "Дүрс 1–4 тэмдэгт (emoji) байна";
  if (form.threshold === "" || !Number.isInteger(threshold) || threshold < info.min || threshold > info.max) {
    errors.threshold = `Босго ${info.min}–${info.max.toLocaleString("en-US")} хооронд бүхэл тоо байна`;
  }
  if (!Number.isInteger(xpReward) || xpReward < 0 || xpReward > 1000) {
    errors.xpReward = "Шагналын XP 0–1000 хооронд бүхэл тоо байна";
  }

  if (Object.keys(errors).length > 0) return { errors, value: null };
  return {
    errors,
    value: { code, title, description, icon, type: form.type, threshold, xpReward },
  };
}

export const toForm = (achievement) => ({
  code: achievement.code,
  title: achievement.title,
  description: achievement.description || "",
  icon: achievement.icon || "🏅",
  type: achievement.type,
  threshold: String(achievement.threshold),
  xpReward: String(achievement.xpReward ?? 0),
});
