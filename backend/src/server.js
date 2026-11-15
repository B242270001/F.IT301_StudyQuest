/**
 * StudyQuest Backend — Lab 4
 * Express.js сервер
 *
 * TASK-04 (Д. Баттөмөр): teacher, uploads route-ууд
 * Бусад TASK-уудын route-ууд дараагийн lab-уудад нэмэгдэнэ.
 *
 * Port: 4000 (vite.config.js → proxy /api → localhost:4000)
 */

const express = require("express");
const cors = require("cors");
const app = express();

/* ── Middleware ── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Health check (TASK-06 эзэмшил) ── */
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* ── TASK-04: Teacher & Uploads routes ── */
const teacherRouter = require("./routes/teacher");
const uploadsRouter = require("./routes/uploads");

app.use("/api/teacher", teacherRouter);
app.use("/api/uploads", uploadsRouter);

/* ── 404 fallback ── */
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint олдсонгүй" });
});

/* ── Error handler ── */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Серверийн алдаа" });
});

/* ── Серверийг асаах (шууд ажиллуулсан үед л listen) ── */
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`StudyQuest backend нь http://localhost:${PORT} дээр ажиллаж байна`);
  });
}

module.exports = app;
