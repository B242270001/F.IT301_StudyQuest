/**
 * TASK-04 — Д. Баттөмөр
 * backend/src/routes/uploads.js
 *
 * POST /api/uploads/material
 * multipart/form-data, file талбар
 * Зөвхөн: pdf, pptx, docx, png, jpg; ≤ 10 MB
 * 201: { url, name, sizeBytes }
 * 413: Хэмжээ хэтэрсэн
 * 422: Буруу файл төрөл
 * 401: Нэвтрээгүй
 * 403: Student
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { requireAuth, requireTeacher } = require("../middleware/auth");

/* ── Зөвшөөрөгдсөн MIME төрлүүд ── */
const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/* ── multer хадгалах тохиргоо (memory storage — Lab 4 mock) ── */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter(req, file, cb) {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // multer-ийн fileFilter-с алдааг req-д дамжуулна
      req.fileTypeError = true;
      cb(null, false);
    }
  },
});

/* ─────────────────────────────────────────────────────────
   POST /api/uploads/material
───────────────────────────────────────────────────────── */
router.post(
  "/material",
  requireAuth,
  requireTeacher,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      // multer-ийн LIMIT_FILE_SIZE алдаа
      if (err && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Файл 10 MB-аас их байна" });
      }
      if (err) {
        return res.status(422).json({ message: err.message });
      }

      // fileFilter-с татгалзсан (буруу MIME)
      if (req.fileTypeError) {
        return res.status(422).json({
          message: "Зөвхөн pdf, pptx, docx, png, jpg файл",
          field: "file",
        });
      }

      // Файл ирсэн эсэхийг шалгах
      if (!req.file) {
        return res.status(422).json({
          message: "Файл оруулна уу",
          field: "file",
        });
      }

      next();
    });
  },
  (req, res) => {
    const { originalname, size } = req.file;

    // Lab 4 — файлыг санах ойд хадгалах (Lab 6-д disk/cloud руу шилжинэ)
    const url = `/uploads/${Date.now()}-${originalname.replace(/\s+/g, "_")}`;

    return res.status(201).json({
      url,
      name: originalname,
      sizeBytes: size,
    });
  }
);

module.exports = router;
