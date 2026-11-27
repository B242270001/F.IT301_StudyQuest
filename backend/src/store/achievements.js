// TASK-06 (Lab 5): Achievement (тэмдэг) — MongoDB/Mongoose store.
// Lab 4-ийн санах ойн store-ийг сольсон; функцийн гэрээ (Promise) хэвээр тул route өөрчлөгдөөгүй.
// Өгөгдөл зөвхөн MongoDB-д хадгалагдана (in-memory cache байхгүй) → backend restart хийсэн ч хэвээр.
import { Achievement } from "../models/Achievement.js";
import { User } from "../models/User.js";
import { UserAchievement } from "../models/UserAchievement.js";
import { getLeaderboard } from "./users.js";

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

const seedToDoc = ({ id, ...rest }) => ({ _id: id, ...rest });
const toJSON = (doc) => (doc ? doc.toJSON() : null);

// Server асахад: collection хоосон бол seed-ийг нэг удаа үүсгэнэ. Одоо байгаа өгөгдлийг устгахгүй.
export async function seedAchievements() {
  if ((await Achievement.estimatedDocumentCount()) > 0) return false;
  await Achievement.insertMany(SEED_ACHIEVEMENTS.map(seedToDoc));
  return true;
}

// Тестэд зориулсан: тэмдэг болон олголтыг цэвэрлээд seed-ийг дахин үүсгэнэ.
export async function resetAchievements() {
  await Promise.all([Achievement.deleteMany({}), UserAchievement.deleteMany({})]);
  await Achievement.insertMany(SEED_ACHIEVEMENTS.map(seedToDoc));
}

async function nextId() {
  const ids = await Achievement.find({ _id: /^A\d+$/ }, { _id: 1 }).lean();
  const max = ids.reduce((acc, { _id }) => Math.max(acc, Number(_id.slice(1))), 0);
  return `A${String(max + 1).padStart(2, "0")}`;
}

export async function listAchievements({ type } = {}) {
  const docs = await Achievement.find(type ? { type } : {}).sort({ _id: 1 });
  return docs.map(toJSON);
}

// Дэлгэрэнгүйд хэдэн хэрэглэгч энэ тэмдгийг авсныг (UserAchievement хамаарал) хамт буцаана.
export async function findAchievement(id) {
  const doc = await Achievement.findById(id);
  if (!doc) return null;
  const holderCount = await UserAchievement.countDocuments({ achievement: doc._id });
  return { ...doc.toJSON(), holderCount };
}

export async function isCodeTaken(code, exceptId = null) {
  const filter = exceptId ? { code, _id: { $ne: exceptId } } : { code };
  return Boolean(await Achievement.exists(filter));
}

export async function createAchievement(data) {
  return toJSON(await Achievement.create({ _id: await nextId(), ...data }));
}

export async function updateAchievement(id, data) {
  const doc = await Achievement.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  return toJSON(doc);
}

// Тэмдгийг устгахад түүнийг олгосон бүртгэлүүд хамт устна (өнчин UserAchievement үлдэхгүй).
export async function deleteAchievement(id) {
  const result = await Achievement.deleteOne({ _id: id });
  if (result.deletedCount === 0) return false;
  await UserAchievement.deleteMany({ achievement: id });
  return true;
}

/* ---------- UserAchievement (хамаарал) ---------- */

const userSummary = (user) => ({ id: user._id, displayName: user.displayName, role: user.role });

function awardToJSON(award) {
  const json = award.toJSON();
  return {
    id: json.id,
    awardedAt: json.awardedAt,
    awardedBy: json.awardedBy,
    user: award.user?._id ? userSummary(award.user) : json.user,
    achievement: award.achievement?._id ? award.achievement.toJSON() : json.achievement,
  };
}

// Тэмдэг олгох. Алдааны төрлийг route HTTP status болгоно.
export async function awardAchievement(achievementId, userId, awardedBy = null) {
  const achievement = await Achievement.findById(achievementId);
  if (!achievement) return { error: "ACHIEVEMENT_NOT_FOUND" };
  const user = await User.findById(userId);
  if (!user) return { error: "USER_NOT_FOUND" };
  if (await UserAchievement.exists({ user: user._id, achievement: achievement._id })) {
    return { error: "ALREADY_AWARDED" };
  }
  const award = await UserAchievement.create({
    user: user._id,
    achievement: achievement._id,
    awardedBy,
  });
  await award.populate(["user", "achievement"]);
  return { value: awardToJSON(award) };
}

// Хэрэглэгчийн авсан тэмдгүүд (populate-оор Achievement-ийг дэлгэрэнгүй буцаана). Байхгүй хэрэглэгч → null.
export async function listUserAchievements(userId) {
  if (!(await User.exists({ _id: userId }))) return null;
  const awards = await UserAchievement.find({ user: userId })
    .sort({ awardedAt: 1 })
    .populate("achievement");
  return awards.filter((a) => a.achievement).map(awardToJSON);
}

/* ---------- Lab 6: нэвтэрсэн хэрэглэгчийн өөрийн хүрээ (own scope) ---------- */

// Тэмдэг бүрийн биелэлт: XP_TOTAL → totalXp, STREAK → streakDays, WEEKLY_RANK → долоо хоногийн байр.
function progressFor(achievement, user, weeklyRank) {
  const target = achievement.threshold;
  if (achievement.type === "WEEKLY_RANK") {
    const reached = weeklyRank !== null && weeklyRank <= target;
    const percent = reached ? 100 : weeklyRank ? Math.floor((target / weeklyRank) * 100) : 0;
    return { current: weeklyRank, target, percent, reached };
  }
  const current = achievement.type === "STREAK" ? user.streakDays || 0 : user.totalXp || 0;
  return { current, target, percent: Math.min(100, Math.floor((current / target) * 100)), reached: current >= target };
}

async function weeklyRankOf(user) {
  if (user.role !== "STUDENT") return null;
  const row = (await getLeaderboard("weekly")).find((r) => r.id === user._id);
  return row ? row.rank : null;
}

// GET /api/me/achievements: бүх тэмдэг + миний авсан эсэх + биелэлтийн явц.
export async function getMyAchievements(user) {
  const [achievements, awards, weeklyRank] = await Promise.all([
    Achievement.find().sort({ _id: 1 }),
    UserAchievement.find({ user: user._id }),
    weeklyRankOf(user),
  ]);
  const awardedAt = new Map(awards.map((a) => [a.achievement, a.awardedAt]));
  return achievements.map((doc) => ({
    ...doc.toJSON(),
    earned: awardedAt.has(doc._id),
    awardedAt: awardedAt.get(doc._id) ?? null,
    progress: progressFor(doc, user, weeklyRank),
  }));
}

// POST /api/me/achievements/claim: босгод хүрсэн боловч аваагүй тэмдгүүдийг өөртөө олгоно.
// Зөвхөн token-ий эзэнд ажиллана — бусдын нэрийн өмнөөс авах боломжгүй.
export async function claimMyAchievements(user) {
  const before = await getMyAchievements(user);
  const toAward = before.filter((a) => a.progress.reached && !a.earned);
  const awarded = [];
  for (const achievement of toAward) {
    try {
      await UserAchievement.create({ user: user._id, achievement: achievement.id, awardedBy: null });
      awarded.push(achievement);
    } catch (err) {
      if (err?.code !== 11000) throw err; // зэрэг дарсан үед давхардлыг алгасна
    }
  }
  return { awarded: awarded.map(({ id, title, icon, xpReward }) => ({ id, title, icon, xpReward })), achievements: await getMyAchievements(user) };
}
