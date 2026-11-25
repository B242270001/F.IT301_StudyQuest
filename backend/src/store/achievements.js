// TASK-06 (Lab 4): Achievement (тэмдэг) — санах ойн (in-memory) store.
// Lab 5 дээр MongoDB/Mongoose руу шилжүүлнэ; функцүүд Promise буцаадаг тул route өөрчлөгдөхгүй.

export const SEED_ACHIEVEMENTS = [
  {
    id: "A01",
    code: "first-steps",
    title: "Анхны алхам",
    description: "Анхны 100 XP-гээ цуглуул",
    icon: "🌱",
    type: "XP_TOTAL",
    threshold: 100,
    xpReward: 10,
  },
  {
    id: "A02",
    code: "streak-7",
    title: "Долоо хоногийн цуврал",
    description: "7 өдөр дараалан суралц",
    icon: "🔥",
    type: "STREAK",
    threshold: 7,
    xpReward: 50,
  },
  {
    id: "A03",
    code: "top-3",
    title: "Шилдэг гурав",
    description: "Долоо хоногийн чансаанд эхний 3-т ор",
    icon: "🏆",
    type: "WEEKLY_RANK",
    threshold: 3,
    xpReward: 100,
  },
  {
    id: "A04",
    code: "xp-2500",
    title: "XP мастер",
    description: "Нийт 2500 XP цуглуул",
    icon: "⚡",
    type: "XP_TOTAL",
    threshold: 2500,
    xpReward: 150,
  },
];

let achievements = [];

const clone = (item) => ({ ...item });

function nextId() {
  const max = achievements.reduce((acc, { id }) => Math.max(acc, Number(id.slice(1)) || 0), 0);
  return `A${String(max + 1).padStart(2, "0")}`;
}

// Тестэд зориулсан: seed өгөгдлөөр дахин эхлүүлнэ.
export async function resetAchievements() {
  const now = new Date().toISOString();
  achievements = SEED_ACHIEVEMENTS.map((item) => ({ ...item, createdAt: now, updatedAt: now }));
}

export async function listAchievements({ type } = {}) {
  return achievements.filter((item) => !type || item.type === type).map(clone);
}

export async function findAchievement(id) {
  const item = achievements.find((a) => a.id === id);
  return item ? clone(item) : null;
}

export async function isCodeTaken(code, exceptId = null) {
  return achievements.some((a) => a.code === code && a.id !== exceptId);
}

export async function createAchievement(data) {
  const now = new Date().toISOString();
  const item = { id: nextId(), ...data, createdAt: now, updatedAt: now };
  achievements.push(item);
  return clone(item);
}

export async function updateAchievement(id, data) {
  const item = achievements.find((a) => a.id === id);
  if (!item) return null;
  Object.assign(item, data, { updatedAt: new Date().toISOString() });
  return clone(item);
}

export async function deleteAchievement(id) {
  const index = achievements.findIndex((a) => a.id === id);
  if (index === -1) return false;
  achievements.splice(index, 1);
  return true;
}

await resetAchievements();
