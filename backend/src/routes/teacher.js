/**
 * TASK-04 — Д. Баттөмөр
 * backend/src/routes/teacher.js
 *
 * Endpoints:
 *   GET    /api/teacher/overview          → stats, xpByCourse, courses, students
 *   POST   /api/teacher/courses           → Хичээл үүсгэх (201)
 *   PUT    /api/teacher/courses/:id       → Хичээл засах (200)
 *   DELETE /api/teacher/courses/:id       → Хичээл устгах (204)
 *   POST   /api/teacher/lectures          → Лекц үүсгэх (201)
 */

const express = require("express");
const router = express.Router();
const { requireAuth, requireTeacher } = require("../middleware/auth");
const { courses, lectures, students, nextCourseId, nextLectureId } = require("../data/db");

/* ── Validation helpers ── */

/**
 * validateCourseBody — Course POST/PUT хүсэлтийн шалгалт
 * @returns {string[]} алдааны жагсаалт (хоосон бол зөв)
 */
function validateCourseBody({ title, description, category }) {
  const errors = [];
  const VALID_CATEGORIES = ["WEB", "OS", "DATABASE", "PROGRAMMING"];

  if (!title || !title.trim()) {
    errors.push({ message: "Хичээлийн нэр оруулна уу", field: "title" });
  } else if (title.trim().length < 3) {
    errors.push({ message: "Нэр хамгийн багадаа 3 тэмдэгт", field: "title" });
  } else if (title.trim().length > 80) {
    errors.push({ message: "Нэр хамгийн ихдээ 80 тэмдэгт", field: "title" });
  }

  if (!description || !description.trim()) {
    errors.push({ message: "Тайлбар оруулна уу", field: "description" });
  } else if (description.trim().length < 10) {
    errors.push({ message: "Тайлбар хамгийн багадаа 10 тэмдэгт", field: "description" });
  } else if (description.trim().length > 500) {
    errors.push({ message: "Тайлбар хамгийн ихдээ 500 тэмдэгт", field: "description" });
  }

  if (!category) {
    errors.push({ message: "Ангилал сонгоно уу", field: "category" });
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push({ message: "Зөв ангилал сонгоно уу", field: "category" });
  }

  return errors;
}

/* ─────────────────────────────────────────────────────────
   GET /api/teacher/overview
   Статистик, XP chart, хичээл, суралцагчийн жагсаалт
───────────────────────────────────────────────────────── */
router.get("/overview", requireAuth, requireTeacher, (req, res) => {
  const stats = {
    courseCount: courses.length,
    studentCount: students.length,
    avgScore: 78,
    attemptCount: 12,
  };

  const xpByCourse = courses.map((c) => ({
    courseId: c.id,
    title: c.title,
    xp: c.xp ?? 500,
  }));

  const courseList = courses.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    icon: c.icon,
    unitCount: c.unitCount ?? 0,
    lectureCount: c.lectureCount ?? 0,
  }));

  return res.status(200).json({
    stats,
    xpByCourse,
    courses: courseList,
    students,
  });
});

/* ─────────────────────────────────────────────────────────
   POST /api/teacher/courses
   Шинэ хичээл үүсгэх
───────────────────────────────────────────────────────── */
router.post("/courses", requireAuth, requireTeacher, (req, res) => {
  const { title, description, category, icon } = req.body;

  const errors = validateCourseBody({ title, description, category });
  if (errors.length > 0) {
    return res.status(422).json(errors[0]); // Эхний алдааг буцаана
  }

  // Нэр давхардсан эсэхийг шалгах (том жижгийг ялгахгүй)
  const duplicate = courses.find(
    (c) => c.title.toLowerCase() === title.trim().toLowerCase()
  );
  if (duplicate) {
    return res.status(422).json({
      message: "Ийм нэртэй хичээл аль хэдийн байна",
      field: "title",
    });
  }

  const VALID_ICONS = ["web", "os", "db", "code", "mobile", "ai"];
  const newCourse = {
    id: nextCourseId(),
    title: title.trim(),
    description: description.trim(),
    category,
    icon: VALID_ICONS.includes(icon) ? icon : "code",
    isFeatured: false,
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    unitCount: 0,
    lectureCount: 0,
    xp: 500,
  };

  courses.push(newCourse);

  return res.status(201).json({ course: newCourse });
});

/* ─────────────────────────────────────────────────────────
   PUT /api/teacher/courses/:id
   Хичээл засах
───────────────────────────────────────────────────────── */
router.put("/courses/:id", requireAuth, requireTeacher, (req, res) => {
  const { id } = req.params;
  const idx = courses.findIndex((c) => c.id === id);

  if (idx === -1) {
    return res.status(404).json({ message: "Хичээл олдсонгүй" });
  }

  const { title, description, category, icon } = req.body;
  const errors = validateCourseBody({ title, description, category });
  if (errors.length > 0) {
    return res.status(422).json(errors[0]);
  }

  // Нэр давхардсан эсэхийг шалгах (өөрөөсөө бусад)
  const duplicate = courses.find(
    (c) =>
      c.id !== id &&
      c.title.toLowerCase() === title.trim().toLowerCase()
  );
  if (duplicate) {
    return res.status(422).json({
      message: "Ийм нэртэй хичээл аль хэдийн байна",
      field: "title",
    });
  }

  const VALID_ICONS = ["web", "os", "db", "code", "mobile", "ai"];
  courses[idx] = {
    ...courses[idx],
    title: title.trim(),
    description: description.trim(),
    category,
    icon: VALID_ICONS.includes(icon) ? icon : courses[idx].icon,
    updatedAt: new Date().toISOString(),
  };

  return res.status(200).json({ course: courses[idx] });
});

/* ─────────────────────────────────────────────────────────
   DELETE /api/teacher/courses/:id
   Хичээл устгах (204, body-гүй)
───────────────────────────────────────────────────────── */
router.delete("/courses/:id", requireAuth, requireTeacher, (req, res) => {
  const { id } = req.params;
  const idx = courses.findIndex((c) => c.id === id);

  if (idx === -1) {
    return res.status(404).json({ message: "Хичээл олдсонгүй" });
  }

  courses.splice(idx, 1);

  // Холбогдох лекцийг ч устгана (cascade)
  const toRemove = lectures
    .map((l, i) => (l.courseId === id ? i : -1))
    .filter((i) => i !== -1)
    .reverse();
  toRemove.forEach((i) => lectures.splice(i, 1));

  return res.status(204).send();
});

/* ─────────────────────────────────────────────────────────
   POST /api/teacher/lectures
   Лекц үүсгэх
───────────────────────────────────────────────────────── */
router.post("/lectures", requireAuth, requireTeacher, (req, res) => {
  const {
    courseId,
    topicId,
    topicTitle,
    title,
    summary,
    content,
    codeSample,
    demoType,
    knowledgeCheck,
  } = req.body;

  // Шаардлагатай талбарыг шалгах
  if (!title || !title.trim()) {
    return res.status(422).json({
      message: "Лекцийн гарчиг оруулна уу",
      field: "title",
    });
  }

  if (!content || !content.trim()) {
    return res.status(422).json({
      message: "Лекцийн агуулга оруулна уу",
      field: "content",
    });
  }

  if (!courseId) {
    return res.status(422).json({
      message: "Хичээлийн ID оруулна уу",
      field: "courseId",
    });
  }

  // Хичээл байгаа эсэхийг шалгах
  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return res.status(404).json({ message: "Хичээл олдсонгүй" });
  }

  const VALID_DEMO_TYPES = ["NONE", "REACT_RENDER", "CLIENT_SERVER", "HTTP", "STATE"];

  const newLecture = {
    id: nextLectureId(),
    courseId,
    topicId: topicId || null,
    topicTitle: topicTitle || "Шинэ сэдэв",
    title: title.trim(),
    summary: summary ? summary.trim() : "",
    content: content.trim(),
    codeSample: codeSample ? codeSample.trim() : "",
    demoType: VALID_DEMO_TYPES.includes(demoType) ? demoType : "NONE",
    materials: [],
    knowledgeCheck: Array.isArray(knowledgeCheck)
      ? knowledgeCheck
          .filter((q) => q.question && q.question.trim())
          .slice(0, 3) // Хамгийн ихдээ 3
          .map((q) => ({
            question: q.question.trim(),
            options: Array.isArray(q.options)
              ? q.options.map((o) => String(o).trim()).filter(Boolean)
              : [],
            correctAnswer: q.correctAnswer || q.options?.[0] || "",
          }))
      : [],
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
  };

  lectures.push(newLecture);

  // Хичээлийн lectureCount-ийг нэмэгдүүлэх
  const courseIdx = courses.findIndex((c) => c.id === courseId);
  if (courseIdx !== -1) {
    courses[courseIdx].lectureCount = (courses[courseIdx].lectureCount || 0) + 1;
  }

  return res.status(201).json({ lecture: newLecture });
});

module.exports = router;
