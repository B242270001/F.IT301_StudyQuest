// TASK-06 (Lab 5): UserAchievement хамаарал (User ↔ Achievement) ба MongoDB persistence
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { Achievement } from "../src/models/Achievement.js";
import { UserAchievement } from "../src/models/UserAchievement.js";
import { resetAchievements, seedAchievements } from "../src/store/achievements.js";
import { resetStore } from "../src/store/users.js";
import { reconnectTestDB, setupTestDB } from "./helpers/db.js";

setupTestDB();

beforeEach(async () => {
  await resetStore();
  await resetAchievements();
});

const award = (achievementId, userId) =>
  request(app).post(`/api/achievements/${achievementId}/award`).send({ userId });

/* ---------- Тэмдэг олгох ---------- */

test("POST /api/achievements/:id/award links a user to a badge (201) with populated data", async () => {
  const res = await award("A01", "U05");
  assert.equal(res.status, 201);
  assert.ok(res.body.id);
  assert.ok(res.body.awardedAt);
  assert.deepEqual(res.body.user, { id: "U05", displayName: res.body.user.displayName, role: "STUDENT" });
  assert.equal(res.body.achievement.id, "A01");
  assert.equal(res.body.achievement.title, "Анхны алхам");

  const doc = await UserAchievement.findOne({ user: "U05", achievement: "A01" }).lean();
  assert.ok(doc, "award is stored in MongoDB");
});

test("the same badge cannot be awarded twice to the same user (409)", async () => {
  assert.equal((await award("A02", "U05")).status, 201);
  const again = await award("A02", "U05");
  assert.equal(again.status, 409);
  assert.equal(await UserAchievement.countDocuments({ user: "U05", achievement: "A02" }), 1);
});

test("award validation: missing userId 422, unknown user 422, unknown badge 404", async () => {
  const missing = await award("A01", "");
  assert.equal(missing.status, 422);
  assert.equal(missing.body.field, "userId");

  const unknownUser = await award("A01", "U999");
  assert.equal(unknownUser.status, 422);
  assert.equal(unknownUser.body.field, "userId");

  const unknownBadge = await award("A99", "U05");
  assert.equal(unknownBadge.status, 404);

  assert.equal(await UserAchievement.countDocuments(), 0);
});

/* ---------- Хэрэглэгчийн тэмдгүүд ---------- */

test("GET /api/achievements/user/:userId lists that user's badges with the Achievement populated", async () => {
  await award("A01", "U05");
  await award("A03", "U05");
  await award("A01", "U01");

  const res = await request(app).get("/api/achievements/user/U05");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.map((a) => a.achievement.id), ["A01", "A03"]);
  assert.equal(res.body[1].achievement.title, "Шилдэг гурав");

  const none = await request(app).get("/api/achievements/user/U02");
  assert.equal(none.status, 200);
  assert.deepEqual(none.body, []);
});

test("GET /api/achievements/user/:userId returns 404 for an unknown user", async () => {
  const res = await request(app).get("/api/achievements/user/NOPE");
  assert.equal(res.status, 404);
});

test("GET /api/achievements/:id reports how many users hold the badge", async () => {
  await award("A01", "U05");
  await award("A01", "U01");
  const res = await request(app).get("/api/achievements/A01");
  assert.equal(res.status, 200);
  assert.equal(res.body.holderCount, 2);
});

test("deleting a badge also removes its awards (no orphan UserAchievement)", async () => {
  await award("A04", "U05");
  const removed = await request(app).delete("/api/achievements/A04");
  assert.equal(removed.status, 204);

  assert.equal(await UserAchievement.countDocuments({ achievement: "A04" }), 0);
  const mine = await request(app).get("/api/achievements/user/U05");
  assert.deepEqual(mine.body, []);
});

/* ---------- Persistence (backend restart) ---------- */

test("a created badge and its award survive a backend restart (MongoDB reconnect)", async () => {
  const created = await request(app).post("/api/achievements").send({
    code: "restart-proof",
    title: "Restart тэсвэртэй",
    type: "STREAK",
    threshold: 14,
    xpReward: 70,
  });
  assert.equal(created.status, 201);
  const id = created.body.id;
  assert.equal((await award(id, "U05")).status, 201);

  await reconnectTestDB();
  // Restart үед seed дахин ажиллахад одоо байгаа өгөгдөл устахгүй.
  assert.equal(await seedAchievements(), false);

  const detail = await request(app).get(`/api/achievements/${id}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.title, "Restart тэсвэртэй");
  assert.equal(detail.body.holderCount, 1);

  const list = await request(app).get("/api/achievements");
  assert.ok(list.body.some((a) => a.code === "restart-proof"));

  const mine = await request(app).get("/api/achievements/user/U05");
  assert.deepEqual(mine.body.map((a) => a.achievement.id), [id]);
});

test("the Mongoose model enforces the schema even without the route validator", async () => {
  await assert.rejects(
    Achievement.create({ _id: "A90", code: "x", title: "", type: "GOLD", threshold: 0 }),
    (err) => err.name === "ValidationError",
  );
});
