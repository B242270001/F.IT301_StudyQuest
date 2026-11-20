// TASK-01 (Lab 5): Нэвтрэлтийн token — Session.user → User
// Token-ийг MongoDB-д хадгалснаар backend restart хийсний дараа ч session хүчинтэй байна.
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    user: { type: String, ref: "User", required: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
