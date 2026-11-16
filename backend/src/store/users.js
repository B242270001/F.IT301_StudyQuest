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

let users = [];
let tokens = new Map();
let nextUserNumber = 11;

function cloneSeed() {
  return SEED_USERS.map((user) => ({ ...user }));
}

export function resetStore() {
  users = cloneSeed();
  tokens = new Map();
  nextUserNumber = 11;
}

export function toPublicUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export function listUsers() {
  return users.map(toPublicUser);
}

export function findUserById(id) {
  return users.find((user) => user.id === id) || null;
}

export function findUserByUsername(username) {
  const needle = (username || "").trim().toLowerCase();
  return users.find((user) => user.username.toLowerCase() === needle) || null;
}

export function createUser({ username, password, displayName, role }) {
  const id = `U${String(nextUserNumber).padStart(2, "0")}`;
  nextUserNumber += 1;
  const user = {
    id,
    username,
    password,
    displayName,
    role,
    major: "",
    totalXp: 0,
    weeklyXp: 0,
    todayXp: 0,
    dailyGoalXp: 60,
    streakDays: 0,
    avatar: displayName.trim().charAt(0).toUpperCase() || "?",
    lastActiveAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

export function createSession(user) {
  const token = `tok-${user.id}-${tokens.size + 1}`;
  tokens.set(token, user.id);
  return token;
}

export function getUserByToken(token) {
  const userId = tokens.get(token);
  if (!userId) return null;
  return findUserById(userId);
}

export function computeRank(user) {
  if (!user || user.role !== "STUDENT") return null;
  const ranked = users
    .filter((item) => item.role === "STUDENT")
    .slice()
    .sort((a, b) => b.totalXp - a.totalXp);
  const index = ranked.findIndex((item) => item.id === user.id);
  return index === -1 ? null : index + 1;
}

resetStore();
