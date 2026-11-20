// TASK-01 (Lab 5): User store — Lab 4-ийн in-memory массивыг MongoDB/Mongoose-оор солив.
// Route-ууд өмнөх шигээ энэ модулийн функцуудыг дуудна, зөвхөн бүгд async болсон.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Note } from "../models/Note.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";

const SEED_USERS = [
  {
    id: "U01",
    username: "anujin",
    password: "student123",
    displayName: "Д. Анужин",
    role: "STUDENT",
    major: "Программ хангамж · 3-р курс",
    totalXp: 3240,
    weeklyXp: 780,
    todayXp: 60,
    dailyGoalXp: 60,
    streakDays: 12,
    avatar: "А",
    lastActiveAt: "2026-10-23T10:30:00Z",
  },
  {
    id: "U02",
    username: "saruul",
    password: "student123",
    displayName: "А. Саруул",
    role: "STUDENT",
    major: "Мэдээллийн систем · 2-р курс",
    totalXp: 2960,
    weeklyXp: 680,
    todayXp: 40,
    dailyGoalXp: 60,
    streakDays: 9,
    avatar: "С",
    lastActiveAt: "2026-10-23T09:15:00Z",
  },
  {
    id: "U03",
    username: "bilguun",
    password: "student123",
    displayName: "Э. Билгүүн",
    role: "STUDENT",
    major: "Компьютерын ухаан · 2-р курс",
    totalXp: 2710,
    weeklyXp: 610,
    todayXp: 30,
    dailyGoalXp: 60,
    streakDays: 7,
    avatar: "Б",
    lastActiveAt: "2026-10-22T18:00:00Z",
  },
  {
    id: "U04",
    username: "enkhjin",
    password: "student123",
    displayName: "Б. Энхжин",
    role: "STUDENT",
    major: "Мэдээллийн систем · 2-р курс",
    totalXp: 2350,
    weeklyXp: 520,
    todayXp: 20,
    dailyGoalXp: 60,
    streakDays: 5,
    avatar: "Э",
    lastActiveAt: "2026-10-22T14:30:00Z",
  },
  {
    id: "U05",
    username: "temuulen",
    password: "student123",
    displayName: "Б. Тэмүүлэн",
    role: "STUDENT",
    major: "Программ хангамж · 2-р курс",
    totalXp: 2480,
    weeklyXp: 460,
    todayXp: 40,
    dailyGoalXp: 60,
    streakDays: 7,
    avatar: "Т",
    lastActiveAt: "2026-10-23T11:00:00Z",
  },
  {
    id: "U06",
    username: "nomin",
    password: "student123",
    displayName: "Г. Номин",
    role: "STUDENT",
    major: "Компьютерын ухаан · 2-р курс",
    totalXp: 2120,
    weeklyXp: 410,
    todayXp: 15,
    dailyGoalXp: 60,
    streakDays: 4,
    avatar: "Н",
    lastActiveAt: "2026-10-22T16:45:00Z",
  },
  {
    id: "U07",
    username: "munkh-erdene",
    password: "student123",
    displayName: "Ц. Мөнх-Эрдэнэ",
    role: "STUDENT",
    major: "Мэдээллийн систем · 3-р курс",
    totalXp: 1980,
    weeklyXp: 385,
    todayXp: 10,
    dailyGoalXp: 60,
    streakDays: 2,
    avatar: "М",
    lastActiveAt: "2026-10-21T20:00:00Z",
  },
  {
    id: "U10",
    username: "bagsh",
    password: "teacher123",
    displayName: "Д. Батбаяр",
    role: "TEACHER",
    major: "Багш · Программ хангамж",
    totalXp: 0,
    weeklyXp: 0,
    todayXp: 0,
    dailyGoalXp: 0,
    streakDays: 0,
    avatar: "Б",
    lastActiveAt: "2026-10-23T08:00:00Z",
  },
];

const FIRST_NEW_USER_NUMBER = 11;

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(expected, actual);
}

function seedToDoc({ id, password, ...rest }) {
  return { _id: id, ...rest, passwordHash: hashPassword(password) };
}

// Хоосон database дээр анхны хэрэглэгчдийг нэг удаа үүсгэнэ.
// Өгөгдөл байгаа бол юу ч хийхгүй — restart хийхэд шинэ record устахгүй.
export async function seedUsers() {
  const count = await User.estimatedDocumentCount();
  if (count > 0) return false;
  await User.insertMany(SEED_USERS.map(seedToDoc));
  return true;
}

// Тестэд зориулсан: бүх collection-ийг цэвэрлээд seed-ийг дахин үүсгэнэ.
export async function resetStore() {
  await Promise.all([User.deleteMany({}), Session.deleteMany({}), Note.deleteMany({})]);
  await User.insertMany(SEED_USERS.map(seedToDoc));
}

export function toPublicUser(user) {
  if (!user) return null;
  return typeof user.toJSON === "function" ? user.toJSON() : user;
}

export async function listUsers() {
  const users = await User.find().sort({ _id: 1 });
  return users.map(toPublicUser);
}

export async function findUserById(id) {
  return User.findById(String(id));
}

export async function findUserByUsername(username, { withPassword = false } = {}) {
  const needle = String(username || "").trim().toLowerCase();
  if (!needle) return null;
  const query = User.findOne({ username: needle });
  return withPassword ? query.select("+passwordHash") : query;
}

async function nextUserId() {
  const ids = await User.find({ _id: /^U\d+$/ }, { _id: 1 }).lean();
  const max = ids.reduce((acc, { _id }) => Math.max(acc, Number(_id.slice(1))), 0);
  return `U${String(Math.max(max + 1, FIRST_NEW_USER_NUMBER)).padStart(2, "0")}`;
}

export async function createUser({ username, password, displayName, role }) {
  const user = await User.create({
    _id: await nextUserId(),
    username,
    passwordHash: hashPassword(password),
    displayName,
    role,
    major: "",
    dailyGoalXp: 60,
    avatar: displayName.trim().charAt(0).toUpperCase() || "?",
    lastActiveAt: new Date(),
  });
  return user;
}

export async function createSession(user) {
  const token = `tok-${randomBytes(24).toString("hex")}`;
  await Session.create({ token, user: user._id });
  return token;
}

export async function deleteSession(token) {
  await Session.deleteOne({ token });
}

export async function getUserByToken(token) {
  const session = await Session.findOne({ token }).populate("user");
  return session?.user || null;
}

export async function computeRank(user) {
  if (!user || user.role !== "STUDENT") return null;
  const ahead = await User.countDocuments({ role: "STUDENT", totalXp: { $gt: user.totalXp } });
  return ahead + 1;
}
