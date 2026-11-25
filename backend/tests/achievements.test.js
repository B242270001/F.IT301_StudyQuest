// TASK-06 (Lab 4): /api/achievements — REST endpoint ба validation (Supertest)
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { resetAchievements } from "../src/store/achievements.js";

const valid = {
  code: "streak-30",
  title: "Сарын цуврал",
  description: "30 өдөр дараалан суралц",
  icon: "📅",
  type: "STREAK",
  threshold: 30,
  xpReward: 200,
};

beforeEach(async () => {
  await resetAchievements();
});

/* ---------- GET list / detail ---------- */

test("GET /api/achievements returns 200 with the seeded badges", async () => {
  const res = await request(app).get("/api/achievements");
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.deepEqual(res.body.map((a) => a.id), ["A01", "A02", "A03", "A04"]);
  assert.equal(res.body[0].code, "first-steps");
});

test("GET /api/achievements?type= filters by type and rejects unknown types with 422", async () => {
  const xp = await request(app).get("/api/achievements?type=xp_total");
  assert.equal(xp.status, 200);
  assert.deepEqual(xp.body.map((a) => a.id), ["A01", "A04"]);

  const bad = await request(app).get("/api/achievements?type=GOLD");
  assert.equal(bad.status, 422);
  assert.equal(bad.body.field, "type");
});

test("GET /api/achievements/:id returns 200 for an existing badge and 404 otherwise", async () => {
  const found = await request(app).get("/api/achievements/A03");
  assert.equal(found.status, 200);
  assert.equal(found.body.title, "Шилдэг гурав");
  assert.equal(found.body.type, "WEEKLY_RANK");

  const missing = await request(app).get("/api/achievements/A99");
  assert.equal(missing.status, 404);
  assert.ok(missing.body.message);
});

/* ---------- POST create ---------- */

test("POST /api/achievements creates a badge with 201 and a new id, then GET reads it", async () => {
  const created = await request(app).post("/api/achievements").send(valid);
  assert.equal(created.status, 201);
  assert.equal(created.body.id, "A05");
  assert.equal(created.body.title, "Сарын цуврал");
  assert.equal(created.body.threshold, 30);

  const detail = await request(app).get(`/api/achievements/${created.body.id}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.code, "streak-30");
});

test("POST /api/achievements trims text, lower-cases the code and applies defaults", async () => {
  const res = await request(app)
    .post("/api/achievements")
    .send({ code: "  Night-Owl ", title: "  Шөнийн шувуу  ", type: "xp_total", threshold: "500" });
  assert.equal(res.status, 201);
  assert.equal(res.body.code, "night-owl");
  assert.equal(res.body.title, "Шөнийн шувуу");
  assert.equal(res.body.type, "XP_TOTAL");
  assert.equal(res.body.threshold, 500);
  assert.equal(res.body.icon, "🏅");
  assert.equal(res.body.xpReward, 0);
});

const invalidCases = [
  ["empty title", { title: "  " }, "title"],
  ["missing code", { code: undefined }, "code"],
  ["code with spaces", { code: "bad code" }, "code"],
  ["unknown type", { type: "GOLD" }, "type"],
  ["zero threshold", { threshold: 0 }, "threshold"],
  ["fractional threshold", { threshold: 2.5 }, "threshold"],
  ["streak over 365 days", { threshold: 400 }, "threshold"],
  ["weekly rank over 50", { type: "WEEKLY_RANK", threshold: 51 }, "threshold"],
  ["negative xpReward", { xpReward: -5 }, "xpReward"],
  ["xpReward over 1000", { xpReward: 5000 }, "xpReward"],
  ["description over 200 chars", { description: "a".repeat(201) }, "description"],
];

for (const [name, patch, field] of invalidCases) {
  test(`POST /api/achievements returns 422 for ${name} and creates nothing`, async () => {
    const res = await request(app).post("/api/achievements").send({ ...valid, ...patch });
    assert.equal(res.status, 422);
    assert.equal(res.body.field, field);
    assert.ok(res.body.message);

    const list = await request(app).get("/api/achievements");
    assert.equal(list.body.length, 4);
  });
}

test("POST /api/achievements returns 422 for a duplicate code", async () => {
  const res = await request(app).post("/api/achievements").send({ ...valid, code: "top-3" });
  assert.equal(res.status, 422);
  assert.equal(res.body.field, "code");
});

test("POST /api/achievements returns 400 for malformed JSON", async () => {
  const res = await request(app)
    .post("/api/achievements")
    .set("Content-Type", "application/json")
    .send('{"title": ');
  assert.equal(res.status, 400);
});

/* ---------- PUT update / DELETE ---------- */

test("PUT /api/achievements/:id updates only the given fields (200)", async () => {
  const res = await request(app).put("/api/achievements/A02").send({ title: "Долоон өдрийн гал", xpReward: 75 });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, "Долоон өдрийн гал");
  assert.equal(res.body.xpReward, 75);
  assert.equal(res.body.threshold, 7);

  const detail = await request(app).get("/api/achievements/A02");
  assert.equal(detail.body.title, "Долоон өдрийн гал");
});

test("PUT /api/achievements/:id returns 422 for invalid data and keeps the old values", async () => {
  const res = await request(app).put("/api/achievements/A02").send({ title: "" });
  assert.equal(res.status, 422);
  assert.equal(res.body.field, "title");

  const detail = await request(app).get("/api/achievements/A02");
  assert.equal(detail.body.title, "Долоо хоногийн цуврал");
});

test("PUT /api/achievements/:id returns 404 for a missing badge and 422 for another badge's code", async () => {
  const missing = await request(app).put("/api/achievements/A99").send({ title: "Шинэ" });
  assert.equal(missing.status, 404);

  const dup = await request(app).put("/api/achievements/A02").send({ code: "first-steps" });
  assert.equal(dup.status, 422);
  assert.equal(dup.body.field, "code");
});

test("DELETE /api/achievements/:id returns 204 without a body, then 404", async () => {
  const removed = await request(app).delete("/api/achievements/A04");
  assert.equal(removed.status, 204);
  assert.equal(removed.text, "");

  const detail = await request(app).get("/api/achievements/A04");
  assert.equal(detail.status, 404);

  const again = await request(app).delete("/api/achievements/A04");
  assert.equal(again.status, 404);
});
