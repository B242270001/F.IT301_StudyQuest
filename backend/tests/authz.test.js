// TASK-01 (Lab 6): register, JWT, 401/403 role-based authorization
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../src/app.js";
import { getJwtSecret } from "../src/auth/jwt.js";
import { Note } from "../src/models/Note.js";
import { Session } from "../src/models/Session.js";
import { User } from "../src/models/User.js";
import { resetStore } from "../src/store/users.js";
import { setupTestDB } from "./helpers/db.js";

setupTestDB();

beforeEach(async () => {
  await resetStore();
});

async function login(username, password = "student123") {
  const res = await request(app).post("/api/auth/login").send({ username, password });
  return res.body.token;
}
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

/* ---------- Register ---------- */

test("POST /api/auth/register creates a STUDENT, returns 201 + JWT that works on a protected route", async () => {
  const res = await request(app).post("/api/auth/register").send({
    username: "newstudent",
    password: "secret123",
    displayName: "Шинэ Оюутан",
    gender: "female",
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.tokenType, "Bearer");
  assert.equal(res.body.user.role, "STUDENT");
  assert.equal(res.body.token.split(".").length, 3, "token is a JWT");

  const me = await request(app).get("/api/auth/me").set(bearer(res.body.token));
  assert.equal(me.status, 200);
  assert.equal(me.body.username, "newstudent");
  assert.equal(me.body.passwordHash, undefined);
});

test("register ignores a requested TEACHER role (no privilege escalation)", async () => {
  const res = await request(app).post("/api/auth/register").send({
    username: "sneaky",
    password: "secret123",
    displayName: "Сэмхэн",
    role: "TEACHER",
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.role, "STUDENT");
});

test("register validates input (422) and rejects a taken username (409)", async () => {
  const short = await request(app)
    .post("/api/auth/register")
    .send({ username: "abc", password: "123", displayName: "Богино" });
  assert.equal(short.status, 422);
  assert.equal(short.body.field, "password");

  const taken = await request(app)
    .post("/api/auth/register")
    .send({ username: "temuulen", password: "secret123", displayName: "Давхар" });
  assert.equal(taken.status, 409);
  assert.equal(taken.body.field, "username");
});

/* ---------- JWT / 401 ---------- */

test("protected routes return 401 without a token, with a forged token and with an expired token", async () => {
  const none = await request(app).get("/api/user/profile");
  assert.equal(none.status, 401);

  const forged = jwt.sign({ sub: "U05", role: "TEACHER", jti: "x" }, "wrong-secret", { issuer: "studyquest" });
  assert.equal((await request(app).get("/api/user/profile").set(bearer(forged))).status, 401);

  const expired = jwt.sign({ sub: "U05", role: "STUDENT", jti: "x" }, getJwtSecret(), {
    issuer: "studyquest",
    expiresIn: -10,
  });
  assert.equal((await request(app).get("/api/notes").set(bearer(expired))).status, 401);
});

test("logout revokes the JWT on the server (same token → 401 afterwards)", async () => {
  const token = await login("temuulen");
  assert.equal((await request(app).get("/api/user/profile").set(bearer(token))).status, 200);

  const out = await request(app).post("/api/auth/logout").set(bearer(token));
  assert.equal(out.status, 204);

  assert.equal((await request(app).get("/api/user/profile").set(bearer(token))).status, 401);
  assert.equal(await Session.countDocuments(), 0);
});

/* ---------- Role-based authorization (403) ---------- */

test("DELETE /api/users/:id — anonymous 401, STUDENT 403, TEACHER 204 and cascades notes", async () => {
  const studentToken = await login("temuulen");
  await request(app).post("/api/notes").set(bearer(studentToken)).send({ content: "миний тэмдэглэл" });

  const anon = await request(app).delete("/api/users/U05");
  assert.equal(anon.status, 401);

  const asStudent = await request(app).delete("/api/users/U04").set(bearer(studentToken));
  assert.equal(asStudent.status, 403);
  assert.ok(await User.findById("U04"), "student could not delete");

  const teacherToken = await login("bagsh", "teacher123");
  const asTeacher = await request(app).delete("/api/users/U05").set(bearer(teacherToken));
  assert.equal(asTeacher.status, 204);
  assert.equal(await User.findById("U05"), null);
  assert.equal(await Note.countDocuments({ owner: "U05" }), 0);

  // устгагдсан хэрэглэгчийн token цааш ажиллахгүй
  assert.equal((await request(app).get("/api/notes").set(bearer(studentToken))).status, 401);
});

test("DELETE /api/users/:id — teacher gets 404 for a missing user and 422 for deleting themself", async () => {
  const teacherToken = await login("bagsh", "teacher123");
  assert.equal((await request(app).delete("/api/users/NOPE").set(bearer(teacherToken))).status, 404);
  assert.equal((await request(app).delete("/api/users/U10").set(bearer(teacherToken))).status, 422);
});

test("role is checked from the database, not trusted from the token", async () => {
  // Багшаар нэвтэрч token авсны ДАРАА DB дээр эрхийг нь бууруулна
  const teacherToken = await login("bagsh", "teacher123");
  await User.updateOne({ _id: "U10" }, { role: "STUDENT" });
  const res = await request(app).delete("/api/users/U05").set(bearer(teacherToken));
  assert.equal(res.status, 403);
});

test("POST /api/users with role TEACHER: anonymous 401, student 403, teacher 201", async () => {
  const body = { username: "newteacher", password: "secret123", displayName: "Шинэ Багш", role: "TEACHER" };

  assert.equal((await request(app).post("/api/users").send(body)).status, 401);

  const studentToken = await login("temuulen");
  assert.equal((await request(app).post("/api/users").set(bearer(studentToken)).send(body)).status, 403);

  const teacherToken = await login("bagsh", "teacher123");
  const ok = await request(app).post("/api/users").set(bearer(teacherToken)).send(body);
  assert.equal(ok.status, 201);
  assert.equal(ok.body.role, "TEACHER");
});
