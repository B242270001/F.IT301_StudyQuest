// TASK-01: /api/user/avatar ба /api/leaderboard — MongoDB дээрх дүрийн тохиргоо
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { User } from "../src/models/User.js";
import { resetStore, seedUsers } from "../src/store/users.js";
import { useTestDB } from "./helpers/db.js";

useTestDB();

let auth;

const VALID = {
  body: "male",
  skinTone: "#d9a074",
  hairStyle: "bun",
  hairColor: "#7c5cfc",
  outfit: "deel",
  outfitColor: "#10B981",
  accessory: "glasses",
};

beforeEach(async () => {
  await resetStore();
  const login = await request(app)
    .post("/api/auth/login")
    .send({ username: "temuulen", password: "student123" });
  auth = { Authorization: `Bearer ${login.body.token}` };
});

test("GET /api/user/avatar returns 401 without a token", async () => {
  const res = await request(app).get("/api/user/avatar");
  assert.equal(res.status, 401);
});

test("GET /api/user/avatar returns the seeded config and the allowed options", async () => {
  const res = await request(app).get("/api/user/avatar").set(auth);
  assert.equal(res.status, 200);
  assert.equal(res.body.avatarConfig.hairStyle, "curly");
  assert.ok(res.body.options.outfit.includes("deel"));
});

test("PUT /api/user/avatar saves the config to MongoDB and profile returns it", async () => {
  const res = await request(app).put("/api/user/avatar").set(auth).send(VALID);
  assert.equal(res.status, 200);
  assert.equal(res.body.avatarConfig.outfitColor, "#10b981");

  const stored = await User.findById("U05").lean();
  assert.equal(stored.avatarConfig.outfit, "deel");

  const profile = await request(app).get("/api/user/profile").set(auth);
  assert.equal(profile.body.avatarConfig.hairStyle, "bun");
});

test("PUT /api/user/avatar returns 422 for an unknown option and keeps the old config", async () => {
  const res = await request(app)
    .put("/api/user/avatar")
    .set(auth)
    .send({ ...VALID, outfit: "spacesuit" });
  assert.equal(res.status, 422);
  assert.equal(res.body.field, "outfit");

  const stored = await User.findById("U05").lean();
  assert.equal(stored.avatarConfig.outfit, "hoodie");
});

test("PUT /api/user/avatar returns 422 for a bad color", async () => {
  const res = await request(app)
    .put("/api/user/avatar")
    .set(auth)
    .send({ ...VALID, hairColor: "red; drop" });
  assert.equal(res.status, 422);
  assert.equal(res.body.field, "hairColor");
});

test("POST /api/users picks a default avatar from gender", async () => {
  const male = await request(app).post("/api/users").send({
    username: "newboy",
    password: "secret123",
    displayName: "Шинэ Хүү",
    gender: "male",
  });
  assert.equal(male.status, 201);
  assert.equal(male.body.avatarConfig.body, "male");
  assert.ok(["short", "buzz", "curly"].includes(male.body.avatarConfig.hairStyle));

  const bad = await request(app).post("/api/users").send({
    username: "newx",
    password: "secret123",
    displayName: "Шинэ",
    gender: "robot",
  });
  assert.equal(bad.status, 422);
  assert.equal(bad.body.field, "gender");
});

test("seedUsers backfills avatarConfig for users created before the avatar feature", async () => {
  await User.collection.updateMany({}, { $unset: { avatarConfig: "", lastWeekRank: "" } });
  await seedUsers();
  const stored = await User.collection.findOne({ _id: "U02" });
  assert.equal(stored.avatarConfig.outfit, "deel");
  assert.equal(stored.lastWeekRank, 1);
});

test("GET /api/leaderboard ranks students by weekly XP with avatars and change", async () => {
  const res = await request(app).get("/api/leaderboard");
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.body.slice(0, 3).map((r) => [r.rank, r.id, r.xp]),
    [
      [1, "U01", 780],
      [2, "U02", 680],
      [3, "U03", 610],
    ],
  );
  assert.ok(res.body.every((r) => r.id !== "U10"), "teacher is not ranked");
  const me = res.body.find((r) => r.id === "U05");
  assert.equal(me.rank, 5);
  assert.equal(me.change, 3);
  assert.equal(me.avatarConfig.accessory, "headphones");
  assert.equal(me.passwordHash, undefined);
});

test("GET /api/leaderboard?period=allTime ranks by total XP; bad period is 422", async () => {
  const res = await request(app).get("/api/leaderboard?period=allTime");
  assert.equal(res.status, 200);
  assert.deepEqual(
    res.body.map((r) => r.id).slice(0, 5),
    ["U01", "U02", "U03", "U05", "U04"],
  );
  assert.ok(res.body.every((r) => r.change === 0));

  const bad = await request(app).get("/api/leaderboard?period=yearly");
  assert.equal(bad.status, 422);
});
