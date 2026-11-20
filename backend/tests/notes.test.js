// TASK-01 (Lab 5): /api/notes — MongoDB дээрх тэмдэглэлийн CRUD
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { resetStore } from "../src/store/users.js";
import { useTestDB } from "./helpers/db.js";

useTestDB();

let token;

async function login(username = "temuulen") {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ username, password: "student123" });
  return res.body.token;
}

beforeEach(async () => {
  await resetStore();
  token = await login();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

test("GET /api/notes returns 401 without a token", async () => {
  const res = await request(app).get("/api/notes");
  assert.equal(res.status, 401);
});

test("POST /api/notes creates a note (201) and GET lists it", async () => {
  const created = await request(app).post("/api/notes").set(auth()).send({ content: "  Ez 4 GPA  " });
  assert.equal(created.status, 201);
  assert.ok(created.body.id);
  assert.equal(created.body.content, "Ez 4 GPA");
  assert.equal(created.body.owner, "U05");

  const list = await request(app).get("/api/notes").set(auth());
  assert.equal(list.status, 200);
  assert.deepEqual(list.body.map((n) => n.content), ["Ez 4 GPA"]);
});

test("POST /api/notes returns 422 for empty content and creates nothing", async () => {
  const res = await request(app).post("/api/notes").set(auth()).send({ content: "   " });
  assert.equal(res.status, 422);
  assert.equal(res.body.field, "content");
  const list = await request(app).get("/api/notes").set(auth());
  assert.equal(list.body.length, 0);
});

test("POST /api/notes returns 422 for content over 150 chars", async () => {
  const res = await request(app).post("/api/notes").set(auth()).send({ content: "a".repeat(151) });
  assert.equal(res.status, 422);
});

test("POST /api/notes allows at most 3 notes per user", async () => {
  for (const content of ["1", "2", "3"]) {
    const ok = await request(app).post("/api/notes").set(auth()).send({ content });
    assert.equal(ok.status, 201);
  }
  const res = await request(app).post("/api/notes").set(auth()).send({ content: "4" });
  assert.equal(res.status, 422);
});

test("PUT /api/notes/:id updates and DELETE removes the note", async () => {
  const { body: note } = await request(app).post("/api/notes").set(auth()).send({ content: "old" });

  const updated = await request(app).put(`/api/notes/${note.id}`).set(auth()).send({ content: "new" });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.content, "new");

  const removed = await request(app).delete(`/api/notes/${note.id}`).set(auth());
  assert.equal(removed.status, 204);

  const missing = await request(app).delete(`/api/notes/${note.id}`).set(auth());
  assert.equal(missing.status, 404);
});

test("users cannot see or change each other's notes", async () => {
  const { body: note } = await request(app).post("/api/notes").set(auth()).send({ content: "private" });
  const otherToken = await login("saruul");
  const other = { Authorization: `Bearer ${otherToken}` };

  const list = await request(app).get("/api/notes").set(other);
  assert.equal(list.body.length, 0);

  const put = await request(app).put(`/api/notes/${note.id}`).set(other).send({ content: "hacked" });
  assert.equal(put.status, 404);
});

test("invalid note id returns 404 instead of 500", async () => {
  const res = await request(app).put("/api/notes/not-an-id").set(auth()).send({ content: "x" });
  assert.equal(res.status, 404);
});
