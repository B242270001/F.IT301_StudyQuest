// TASK-01 (Lab 5): Dashboard тэмдэглэлийн CRUD — MongoDB дээр, нэвтэрсэн хэрэглэгчийн өөрийнх.
import { Router } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { NOTE_LIMIT_PER_USER, Note } from "../models/Note.js";
import { validateNote } from "../validators/note.js";

export const notesRouter = Router();

notesRouter.use("/notes", requireAuth);

async function findOwnNote(req) {
  if (!mongoose.isValidObjectId(req.params.id)) return null;
  return Note.findOne({ _id: req.params.id, owner: req.user._id });
}

notesRouter.get(
  "/notes",
  asyncHandler(async (req, res) => {
    const notes = await Note.find({ owner: req.user._id }).sort({ createdAt: 1 });
    res.status(200).json(notes);
  }),
);

notesRouter.post(
  "/notes",
  asyncHandler(async (req, res) => {
    const { error, value } = validateNote(req.body);
    if (error) {
      return res.status(error.status).json({ message: error.message, field: error.field });
    }
    const count = await Note.countDocuments({ owner: req.user._id });
    if (count >= NOTE_LIMIT_PER_USER) {
      return res.status(422).json({
        message: `Дээд тал нь ${NOTE_LIMIT_PER_USER} тэмдэглэл нэмэх боломжтой`,
        field: "content",
      });
    }
    const note = await Note.create({ owner: req.user._id, content: value.content });
    res.status(201).json(note);
  }),
);

notesRouter.put(
  "/notes/:id",
  asyncHandler(async (req, res) => {
    const { error, value } = validateNote(req.body);
    if (error) {
      return res.status(error.status).json({ message: error.message, field: error.field });
    }
    const note = await findOwnNote(req);
    if (!note) return res.status(404).json({ message: "Тэмдэглэл олдсонгүй" });
    note.content = value.content;
    await note.save();
    res.status(200).json(note);
  }),
);

notesRouter.delete(
  "/notes/:id",
  asyncHandler(async (req, res) => {
    const note = await findOwnNote(req);
    if (!note) return res.status(404).json({ message: "Тэмдэглэл олдсонгүй" });
    await note.deleteOne();
    res.status(204).end();
  }),
);
