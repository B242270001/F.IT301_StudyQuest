// TASK-06 (Lab 6): Achievement API-ийн authentication / role-based authorization ба өөрийн хүрээ (own scope)
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { UserAchievement } from "../src/models/UserAchievement.js";
import { resetAchievements } from "../src/store/achievements.js";
import { resetStore } from "../src/store/users.js";
import { setupTestDB } from "./helpers/db.js";

setupTestDB();

const tokens = {};

async function login(username, password) {
  const res = await request(app).post("/api/auth/login").send({ username, password });
  assert.equal(res.status, 200, `login ${username}`);
  return res.body.token;
}

beforeEach(async () => {
  await resetStore();
  await resetAchievements();
  tokens.teacher = await login("bagsh", "teacher123");
  tokens.student = await login("temuulen", "student123"); // U05: 2480 XP, 7 өдрийн цуврал, 7 хоногийн 5-р байр
  tokens.leader = await login("anujin", "student123"); // U01: 3240 XP, 12 өдөр, 1-р байр
});

const as = (who) => ({ Authorization: `Bearer ${tokens[who]}` });

const badge = { code: "lab6-badge", title: "Лаб6 тэмдэг", type: "XP_TOTAL", threshold: 1000, xpReward: 25 };

const WRITES = [
  ["POST /api/achievements", (r) => r.post("/api/achievements").send(badge), 201],
  ["PUT /api/achievements/A02", (r) => r.put("/api/achievements/A02").send({ xpReward: 60 }), 200],
  ["DELETE /api/achievements/A04", (r) => r.delete("/api/achievements/A04"), 204],
  ["POST /api/achievements/A01/award", (r) => r.post("/api/achievements/A01/award").send({ userId: "U05" }), 201],
];

/* ---------- 401 / 403 / амжилттай ---------- */

for (const [name, call, okStatus] of WRITES) {
  test(`${name}: anonymous 401, student 403, teacher ${okStatus}`, async () => {
    const anonymous = await call(request(app));
    assert.equal(anonymous.status, 401);

    const student = await call(request(app)).set(as("student"));
    assert.equal(student.status, 403);
    assert.ok(student.body.message);

    const teacher = await call(request(app)).set(as("teacher"));
    assert.equal(teacher.status, okStatus);
  });
}

test("a forbidden or anonymous write changes nothing in MongoDB", async () => {
  await request(app).post("/api/achievements").send(badge);
  await request(app).post("/api/achievements").set(as("student")).send(badge);
  await request(app).delete("/api/achievements/A01").set(as("student"));
  await request(app).post("/api/achievements/A03/award").set(as("student")).send({ userId: "U05" });

  const list = await request(app).get("/api/achievements");
  assert.deepEqual(list.body.map((a) => a.id), ["A01", "A02", "A03", "A04"]);
  assert.equal(await UserAchievement.countDocuments(), 0);
});

test("forged, malformed and logged-out tokens get 401", async () => {
  const forged = await request(app)
    .post("/api/achievements")
    .set({ Authorization: "Bearer not.a.jwt" })
    .send(badge);
  assert.equal(forged.status, 401);

  const noScheme = await request(app).post("/api/achievements").set({ Authorization: tokens.teacher }).send(badge);
  assert.equal(noScheme.status, 401);

  await request(app).post("/api/auth/logout").set(as("teacher"));
  const revoked = await request(app).post("/api/achievements").set(as("teacher")).send(badge);
  assert.equal(revoked.status, 401);
});

test("validation still runs for an authorized teacher (422) and awards record who gave them", async () => {
  const invalid = await request(app).post("/api/achievements").set(as("teacher")).send({ ...badge, title: "" });
  assert.equal(invalid.status, 422);
  assert.equal(invalid.body.field, "title");

  const awarded = await request(app).post("/api/achievements/A02/award").set(as("teacher")).send({ userId: "U05" });
  assert.equal(awarded.status, 201);
  assert.equal(awarded.body.awardedBy, "U10");
});

test("public reads stay open without a token", async () => {
  assert.equal((await request(app).get("/api/achievements")).status, 200);
  assert.equal((await request(app).get("/api/achievements/A01")).status, 200);
  assert.equal((await request(app).get("/api/achievements/user/U05")).status, 200);
});

/* ---------- /api/me/achievements (өөрийн хүрээ) ---------- */

test("GET /api/me/achievements requires a token (401)", async () => {
  const res = await request(app).get("/api/me/achievements");
  assert.equal(res.status, 401);
});

test("GET /api/me/achievements returns my progress towards every badge", async () => {
  const res = await request(app).get("/api/me/achievements").set(as("student"));
  assert.equal(res.status, 200);
  const byId = Object.fromEntries(res.body.map((a) => [a.id, a]));

  assert.deepEqual(byId.A01.progress, { current: 2480, target: 100, percent: 100, reached: true });
  assert.deepEqual(byId.A02.progress, { current: 7, target: 7, percent: 100, reached: true });
  assert.deepEqual(byId.A03.progress, { current: 5, target: 3, percent: 60, reached: false });
  assert.deepEqual(byId.A04.progress, { current: 2480, target: 2500, percent: 99, reached: false });
  assert.ok(res.body.every((a) => a.earned === false && a.awardedAt === null));
});

test("POST /api/me/achievements/claim awards only my reached badges, once", async () => {
  const anonymous = await request(app).post("/api/me/achievements/claim");
  assert.equal(anonymous.status, 401);

  const first = await request(app).post("/api/me/achievements/claim").set(as("student"));
  assert.equal(first.status, 200);
  assert.deepEqual(first.body.awarded.map((a) => a.id), ["A01", "A02"]);
  const earned = first.body.achievements.filter((a) => a.earned).map((a) => a.id);
  assert.deepEqual(earned, ["A01", "A02"]);

  const again = await request(app).post("/api/me/achievements/claim").set(as("student"));
  assert.equal(again.status, 200);
  assert.deepEqual(again.body.awarded, []);

  // Зөвхөн token-ий эзэнд олгогдоно — бусад хэрэглэгчид нөлөөлөхгүй
  assert.equal(await UserAchievement.countDocuments({ user: { $ne: "U05" } }), 0);
  const leader = await request(app).post("/api/me/achievements/claim").set(as("leader"));
  assert.deepEqual(leader.body.awarded.map((a) => a.id), ["A01", "A02", "A03", "A04"]);
});

test("a teacher has no ranking, so nothing is reached", async () => {
  const res = await request(app).get("/api/me/achievements").set(as("teacher"));
  assert.equal(res.status, 200);
  assert.ok(res.body.every((a) => a.progress.reached === false));
  const rank = res.body.find((a) => a.type === "WEEKLY_RANK");
  assert.equal(rank.progress.current, null);
});
