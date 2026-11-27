// TASK-06 (Lab 5): Achievement (тэмдэг) model.
// `_id`-г User-тэй адил "A01" маягийн string болгож хадгална (team-spec-ийн `/api/achievements/A01`).
import mongoose from "mongoose";
import { ACHIEVEMENT_TYPES } from "../validators/achievement.js";

const achievementSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 40,
    },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    description: { type: String, default: "", trim: true, maxlength: 200 },
    icon: { type: String, default: "🏅" },
    type: { type: String, required: true, enum: ACHIEVEMENT_TYPES },
    threshold: { type: Number, required: true, min: 1 },
    xpReward: { type: Number, default: 0, min: 0, max: 1000 },
  },
  { timestamps: true, versionKey: false },
);

achievementSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Achievement =
  mongoose.models.Achievement || mongoose.model("Achievement", achievementSchema);
