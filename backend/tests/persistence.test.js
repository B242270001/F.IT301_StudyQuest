// TASK-01 (Lab 5): Record үүсгээд backend "restart" (DB холболт тасалж дахин холбох) хийсний
// дараа GET-ээр хэвээр уншигдана. Store-д in-memory cache байхгүйг нотолно.
import assert from "node:assert/strict";
import { before, test } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { User } from "../src/models/User.js";
import { resetStore, seedUsers } from "../src/store/users.js";
import { reconnectTestDB, setupTestDB } from "./helpers/db.js";

setupTestDB();

before(async () => {
  await resetStore();
});

test("user, session and note survive a reconnect to MongoDB", async () => {
  const created = await request(app).post("/api/users").send({
    username: "lab5user",
    password: "secret123",
    displayName: "Лаб5 Хэрэглэгч",
    role: "STUDENT",
  });
  assert.equal(created.status, 201);
  const userId = created.body.id;

  const login = await request(app)
    .post("/api/auth/login")
    .send({ username: "lab5user", password: "secret123" });
  const auth = { Authorization: `Bearer ${login.body.token}` };
  const note = await request(app).post("/api/notes").set(auth).send({ content: "restart-proof" });
  assert.equal(note.status, 201);

  await reconnectTestDB();
  // Restart үед seed дахин ажиллахад одоо байгаа өгөгдөл устахгүй.
  assert.equal(await seedUsers(), false);

  const detail = await request(app).get(`/api/users/${userId}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.username, "lab5user");

  const profile = await request(app).get("/api/user/profile").set(auth);
  assert.equal(profile.status, 200);
  assert.equal(profile.body.id, userId);

  const notes = await request(app).get("/api/notes").set(auth);
  assert.deepEqual(notes.body.map((n) => n.content), ["restart-proof"]);
});

test("passwords are stored hashed, never in plain text", async () => {
  const doc = await User.findById("U05").select("+passwordHash").lean();
  assert.ok(doc.passwordHash);
  assert.notEqual(doc.passwordHash, "student123");
  assert.equal(doc.password, undefined);
});
