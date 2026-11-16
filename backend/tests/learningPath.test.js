import request from "supertest";
import app from "../src/app.js";

describe("Learning Paths API (Lab 4)", () => {
  it("GET /api/learning-paths should return 200 and list of paths", async () => {
    const res = await request(app).get("/api/learning-paths");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/learning-paths/:id should return 404 for non-existent id", async () => {
    const res = await request(app).get("/api/learning-paths/non-existent-id");
    expect(res.status).toBe(404);
  });

  it("POST /api/learning-paths should create a path with valid data (201)", async () => {
    const newPath = {
      title: "Advanced React & Playwright",
      description: "E2E testing and advanced hooks.",
      stepsCount: 6,
      category: "Frontend"
    };
    const res = await request(app).post("/api/learning-paths").send(newPath);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe(newPath.title);
  });

  it("POST /api/learning-paths should return 422 for invalid/missing body data", async () => {
    const invalidPath = {
      title: "", // хоосон гарчиг
      stepsCount: -1
    };
    const res = await request(app).post("/api/learning-paths").send(invalidPath);
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("error");
  });
});