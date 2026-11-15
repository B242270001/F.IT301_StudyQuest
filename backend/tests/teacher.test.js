/**
 * TASK-04 — Д. Баттөмөр
 * backend/tests/teacher.test.js
 *
 * GET  /api/teacher/overview
 * POST /api/teacher/courses
 * PUT  /api/teacher/courses/:id
 * DELETE /api/teacher/courses/:id
 * POST /api/teacher/lectures
 * POST /api/uploads/material
 */

const request = require("supertest");
const app = require("../src/server");

const TEACHER_TOKEN = "mock-teacher-token";
const STUDENT_TOKEN = "mock-student-token";

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

/* ═══════════════════════════════════════════════
   GET /api/teacher/overview
═══════════════════════════════════════════════ */
describe("GET /api/teacher/overview", () => {
  it("200 — Teacher токентой статистик буцаана", async () => {
    const res = await request(app)
      .get("/api/teacher/overview")
      .set(authHeader(TEACHER_TOKEN));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("stats");
    expect(res.body).toHaveProperty("xpByCourse");
    expect(res.body).toHaveProperty("courses");
    expect(res.body).toHaveProperty("students");
    expect(res.body.stats.courseCount).toBeGreaterThan(0);
  });

  it("401 — Токенгүй хүсэлтэд 401 буцаана", async () => {
    const res = await request(app).get("/api/teacher/overview");
    expect(res.status).toBe(401);
  });

  it("403 — Student токентой хандахад 403 буцаана", async () => {
    const res = await request(app)
      .get("/api/teacher/overview")
      .set(authHeader(STUDENT_TOKEN));
    expect(res.status).toBe(403);
  });
});

/* ═══════════════════════════════════════════════
   POST /api/teacher/courses
═══════════════════════════════════════════════ */
describe("POST /api/teacher/courses", () => {
  it("201 — Зөв өгөгдлөөр хичээл үүсгэнэ", async () => {
    const res = await request(app)
      .post("/api/teacher/courses")
      .set(authHeader(TEACHER_TOKEN))
      .send({
        title: "Мобайл хөгжүүлэлт",
        description: "React Native үндэс суурь хичээл.",
        category: "PROGRAMMING",
        icon: "mobile",
      });

    expect(res.status).toBe(201);
    expect(res.body.course).toHaveProperty("id");
    expect(res.body.course.title).toBe("Мобайл хөгжүүлэлт");
    expect(res.body.course.category).toBe("PROGRAMMING");
  });

  it("422 — Нэр хоосон үед 422 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/courses")
      .set(authHeader(TEACHER_TOKEN))
      .send({ title: "", description: "Арван тэмдэгтэй тайлбар", category: "WEB" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("field", "title");
  });

  it("422 — 2 тэмдэгтийн нэртэй 422 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/courses")
      .set(authHeader(TEACHER_TOKEN))
      .send({ title: "AB", description: "Арван тэмдэгтэй тайлбар", category: "WEB" });

    expect(res.status).toBe(422);
    expect(res.body.field).toBe("title");
  });

  it("422 — Тайлбар богино үед 422 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/courses")
      .set(authHeader(TEACHER_TOKEN))
      .send({ title: "Шинэ хичээл", description: "Богино", category: "WEB" });

    expect(res.status).toBe(422);
    expect(res.body.field).toBe("description");
  });

  it("422 — Ангилал буруу үед 422 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/courses")
      .set(authHeader(TEACHER_TOKEN))
      .send({
        title: "Шинэ хичээл нэр",
        description: "Арван тэмдэгтэй тайлбар текст",
        category: "INVALID",
      });

    expect(res.status).toBe(422);
    expect(res.body.field).toBe("category");
  });

  it("401 — Токенгүй 401 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/courses")
      .send({ title: "Test", description: "Test description here", category: "WEB" });
    expect(res.status).toBe(401);
  });

  it("403 — Student токентой 403 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/courses")
      .set(authHeader(STUDENT_TOKEN))
      .send({ title: "Test Course", description: "Test description here", category: "WEB" });
    expect(res.status).toBe(403);
  });
});

/* ═══════════════════════════════════════════════
   PUT /api/teacher/courses/:id
═══════════════════════════════════════════════ */
describe("PUT /api/teacher/courses/:id", () => {
  it("200 — Байгаа хичээлийг засна", async () => {
    const res = await request(app)
      .put("/api/teacher/courses/C01")
      .set(authHeader(TEACHER_TOKEN))
      .send({
        title: "Веб систем шинэчлэгдсэн",
        description: "Шинэчлэгдсэн тайлбар агуулга энд.",
        category: "WEB",
      });

    expect(res.status).toBe(200);
    expect(res.body.course.title).toBe("Веб систем шинэчлэгдсэн");
  });

  it("404 — Байхгүй ID-д 404 буцаана", async () => {
    const res = await request(app)
      .put("/api/teacher/courses/NOTEXIST")
      .set(authHeader(TEACHER_TOKEN))
      .send({
        title: "Нэр текст",
        description: "Тайлбар тайлбар тайлбар агуулга.",
        category: "OS",
      });

    expect(res.status).toBe(404);
  });

  it("422 — Нэр хоосон үед 422 буцаана", async () => {
    const res = await request(app)
      .put("/api/teacher/courses/C02")
      .set(authHeader(TEACHER_TOKEN))
      .send({ title: "", description: "Арван тэмдэгтэй тайлбар", category: "OS" });

    expect(res.status).toBe(422);
    expect(res.body.field).toBe("title");
  });

  it("401 — Токенгүй 401 буцаана", async () => {
    const res = await request(app)
      .put("/api/teacher/courses/C01")
      .send({ title: "Test", description: "Test description", category: "WEB" });
    expect(res.status).toBe(401);
  });

  it("403 — Student токентой 403 буцаана", async () => {
    const res = await request(app)
      .put("/api/teacher/courses/C01")
      .set(authHeader(STUDENT_TOKEN))
      .send({ title: "Test Course", description: "Test description here", category: "WEB" });
    expect(res.status).toBe(403);
  });
});

/* ═══════════════════════════════════════════════
   DELETE /api/teacher/courses/:id
═══════════════════════════════════════════════ */
describe("DELETE /api/teacher/courses/:id", () => {
  it("204 — Байгаа хичээлийг устгана (body-гүй)", async () => {
    // Эхлээд шинэ хичээл нэмэх
    const created = await request(app)
      .post("/api/teacher/courses")
      .set(authHeader(TEACHER_TOKEN))
      .send({
        title: "Устгах тест хичээл",
        description: "Устгах зорилгоор нэмсэн хичээл.",
        category: "OS",
      });

    const courseId = created.body.course.id;

    const res = await request(app)
      .delete(`/api/teacher/courses/${courseId}`)
      .set(authHeader(TEACHER_TOKEN));

    expect(res.status).toBe(204);
    expect(res.text).toBe(""); // body-гүй
  });

  it("404 — Байхгүй ID-д 404 буцаана", async () => {
    const res = await request(app)
      .delete("/api/teacher/courses/NOTEXIST")
      .set(authHeader(TEACHER_TOKEN));
    expect(res.status).toBe(404);
  });

  it("401 — Токенгүй 401 буцаана", async () => {
    const res = await request(app).delete("/api/teacher/courses/C03");
    expect(res.status).toBe(401);
  });

  it("403 — Student токентой 403 буцаана", async () => {
    const res = await request(app)
      .delete("/api/teacher/courses/C03")
      .set(authHeader(STUDENT_TOKEN));
    expect(res.status).toBe(403);
  });
});

/* ═══════════════════════════════════════════════
   POST /api/teacher/lectures
═══════════════════════════════════════════════ */
describe("POST /api/teacher/lectures", () => {
  it("201 — Зөв өгөгдлөөр лекц үүсгэнэ", async () => {
    const res = await request(app)
      .post("/api/teacher/lectures")
      .set(authHeader(TEACHER_TOKEN))
      .send({
        courseId: "C01",
        title: "React Hooks",
        content: "useState болон useEffect-ийн тухай.",
        demoType: "REACT_RENDER",
      });

    expect(res.status).toBe(201);
    expect(res.body.lecture).toHaveProperty("id");
    expect(res.body.lecture.title).toBe("React Hooks");
  });

  it("422 — Лекцийн гарчиг хоосон үед 422 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/lectures")
      .set(authHeader(TEACHER_TOKEN))
      .send({ courseId: "C01", title: "", content: "Агуулга байна." });

    expect(res.status).toBe(422);
    expect(res.body.field).toBe("title");
  });

  it("422 — Лекцийн агуулга хоосон үед 422 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/lectures")
      .set(authHeader(TEACHER_TOKEN))
      .send({ courseId: "C01", title: "Шинэ лекц", content: "" });

    expect(res.status).toBe(422);
    expect(res.body.field).toBe("content");
  });

  it("404 — Байхгүй courseId-д 404 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/lectures")
      .set(authHeader(TEACHER_TOKEN))
      .send({ courseId: "NOTEXIST", title: "Лекц нэр", content: "Агуулга." });

    expect(res.status).toBe(404);
  });

  it("401 — Токенгүй 401 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/lectures")
      .send({ courseId: "C01", title: "Test", content: "Content here" });
    expect(res.status).toBe(401);
  });

  it("403 — Student токентой 403 буцаана", async () => {
    const res = await request(app)
      .post("/api/teacher/lectures")
      .set(authHeader(STUDENT_TOKEN))
      .send({ courseId: "C01", title: "Test", content: "Content here" });
    expect(res.status).toBe(403);
  });
});

/* ═══════════════════════════════════════════════
   POST /api/uploads/material
═══════════════════════════════════════════════ */
describe("POST /api/uploads/material", () => {
  it("201 — PDF файл амжилттай upload хийнэ", async () => {
    const res = await request(app)
      .post("/api/uploads/material")
      .set(authHeader(TEACHER_TOKEN))
      .attach("file", Buffer.from("PDF content"), {
        filename: "slides.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("url");
    expect(res.body).toHaveProperty("name", "slides.pdf");
    expect(res.body).toHaveProperty("sizeBytes");
  });

  it("422 — Зөвшөөрөгдөөгүй файл төрөл (zip) 422 буцаана", async () => {
    const res = await request(app)
      .post("/api/uploads/material")
      .set(authHeader(TEACHER_TOKEN))
      .attach("file", Buffer.from("zip content"), {
        filename: "archive.zip",
        contentType: "application/zip",
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain("pdf");
  });

  it("413 — 10 MB-аас их файл 413 буцаана", async () => {
    const bigBuffer = Buffer.alloc(11 * 1024 * 1024, "x");
    const res = await request(app)
      .post("/api/uploads/material")
      .set(authHeader(TEACHER_TOKEN))
      .attach("file", bigBuffer, {
        filename: "big.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(413);
  });

  it("401 — Токенгүй 401 буцаана", async () => {
    const res = await request(app)
      .post("/api/uploads/material")
      .attach("file", Buffer.from("content"), {
        filename: "test.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(401);
  });

  it("403 — Student токентой 403 буцаана", async () => {
    const res = await request(app)
      .post("/api/uploads/material")
      .set(authHeader(STUDENT_TOKEN))
      .attach("file", Buffer.from("content"), {
        filename: "test.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(403);
  });
});

/* ═══════════════════════════════════════════════
   GET /api/health
═══════════════════════════════════════════════ */
describe("GET /api/health", () => {
  it("200 — {status: ok} буцаана", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
