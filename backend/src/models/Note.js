// TASK-01 (Lab 5): Dashboard-ын тэмдэглэл — Note.owner → User
import mongoose from "mongoose";

export const NOTE_MAX_LENGTH = 150;
export const NOTE_LIMIT_PER_USER = 3;

const noteSchema = new mongoose.Schema(
  {
    owner: { type: String, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: NOTE_MAX_LENGTH },
  },
  { timestamps: true, versionKey: false },
);

noteSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
});

export const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
