import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { resetStore } from "../src/store/users.js";

beforeEach(() => {
  resetStore();
});

test("GET /api/users returns 200 list without passwords", async () => {
  const res = await request(app).get("/api/users");
  assert.equal(res.status, 200);
  assert.equal(Array.isArray(res.body), true);
  assert.ok(res.body.length >= 1);
  assert.equal(res.body[0].password, undefined);
  assert.ok(res.body.some((user) => user.id === "U05"));
});

test("GET /api/users/:id returns 200 for an existing user", async () => {
  const res = await request(app).get("/api/users/U01");
  assert.equal(res.status, 200);
  assert.equal(res.body.id, "U01");
  assert.equal(res.body.username, "anujin");
  assert.equal(res.body.password, undefined);
});

test("GET /api/users/:id returns 404 when the user is missing", async () => {
  const res = await request(app).get("/api/users/NOPE");
  assert.equal(res.status, 404);
  assert.equal(res.body.message, "Хэрэглэгч олдсонгүй");
});

test("POST /api/users creates a user with 201 and an id", async () => {
  const res = await request(app).post("/api/users").send({
    username: "lab4user",
    password: "secret123",
    displayName: "Лабын Хэрэглэгч",
    role: "STUDENT",
  });
  assert.equal(res.status, 201);
  assert.ok(res.body.id);
  assert.equal(res.body.username, "lab4user");
  assert.equal(res.body.displayName, "Лабын Хэрэглэгч");
  assert.equal(res.body.password, undefined);

  const listed = await request(app).get(`/api/users/${res.body.id}`);
  assert.equal(listed.status, 200);
  assert.equal(listed.body.username, "lab4user");
});

test("POST /api/users returns 422 for an empty username and does not create a record", async () => {
  const before = await request(app).get("/api/users");
  const res = await request(app).post("/api/users").send({
    username: "",
    password: "secret123",
    displayName: "Лабын Хэрэглэгч",
  });
  assert.equal(res.status, 422);
  assert.equal(res.body.field, "username");
  const after = await request(app).get("/api/users");
  assert.equal(after.body.length, before.body.length);
});

test("POST /api/users returns 422 for a duplicate username", async () => {
  const res = await request(app).post("/api/users").send({
    username: "temuulen",
    password: "secret123",
    displayName: "Давхардсан",
  });
  assert.equal(res.status, 422);
  assert.equal(res.body.field, "username");
});
