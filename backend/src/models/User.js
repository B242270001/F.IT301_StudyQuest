// TASK-01 (Lab 5): User model — docs/03-data-model.md §1
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // API гэрээ (team-spec.json) `/api/users/U01` хэлбэрийн id ашигладаг тул
    // _id-г "U01" маягийн string болгож хадгална.
    _id: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    displayName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["STUDENT", "TEACHER"], default: "STUDENT" },
    major: { type: String, default: "" },
    totalXp: { type: Number, default: 0, min: 0 },
    weeklyXp: { type: Number, default: 0, min: 0 },
    todayXp: { type: Number, default: 0, min: 0 },
    dailyGoalXp: { type: Number, default: 60, min: 0, max: 500 },
    streakDays: { type: Number, default: 0, min: 0 },
    avatar: { type: String, default: "?" },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

// API response-д passwordHash, _id-г гаргахгүй, оронд нь `id` буцаана.
userSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
