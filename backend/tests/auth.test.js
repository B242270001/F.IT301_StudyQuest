import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import request from "supertest";
import { app } from "../src/app.js";
import { resetStore } from "../src/store/users.js";

beforeEach(() => {
  resetStore();
});

test("POST /api/auth/login returns 200 and a token for valid credentials", async () => {
  const res = await request(app).post("/api/auth/login").send({
    username: "temuulen",
    password: "student123",
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.id, "U05");
  assert.equal(res.body.user.role, "STUDENT");
});

test("POST /api/auth/login returns 422 when username is missing", async () => {
  const res = await request(app).post("/api/auth/login").send({
    username: "",
    password: "student123",
  });
  assert.equal(res.status, 422);
  assert.equal(res.body.field, "username");
});

test("POST /api/auth/login returns 401 for wrong password", async () => {
  const res = await request(app).post("/api/auth/login").send({
    username: "temuulen",
    password: "wrong-pass",
  });
  assert.equal(res.status, 401);
});

test("GET /api/user/profile returns 401 without a token", async () => {
  const res = await request(app).get("/api/user/profile");
  assert.equal(res.status, 401);
});

test("GET /api/user/profile returns 200 for a logged-in user", async () => {
  const login = await request(app).post("/api/auth/login").send({
    username: "saruul",
    password: "student123",
  });
  const res = await request(app)
    .get("/api/user/profile")
    .set("Authorization", `Bearer ${login.body.token}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.id, "U02");
  assert.equal(res.body.displayName, "А. Саруул");
  assert.equal(res.body.role, "STUDENT");
  assert.equal(res.body.password, undefined);
  assert.equal(typeof res.body.totalXp, "number");
  assert.equal(typeof res.body.rank, "number");
});
