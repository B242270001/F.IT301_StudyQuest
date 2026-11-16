import express from "express";
import { getLearningPaths, getLearningPathById, createLearningPath } from "../store/learningPaths.js";
import { validateLearningPath } from "../validators/learningPath.js";

const router = express.Router();

// GET list
router.get("/", (req, res) => {
  const paths = getLearningPaths();
  res.status(200).json(paths);
});

// GET detail
router.get("/:id", (req, res) => {
  const path = getLearningPathById(req.params.id);
  if (!path) {
    return res.status(404).json({ error: "Learning path not found." });
  }
  res.status(200).json(path);
});

// POST create
router.post("/", validateLearningPath, (req, res) => {
  const newPath = createLearningPath(req.body);
  res.status(201).json(newPath);
});

export default router;