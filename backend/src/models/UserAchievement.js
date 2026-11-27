// TASK-06 (Lab 5): Хэрэглэгчид олгосон тэмдэг — UserAchievement.user → User, .achievement → Achievement.
// Нэг хэрэглэгчид нэг тэмдэг нэг л удаа олгогдоно (user + achievement unique index).
import mongoose from "mongoose";

const userAchievementSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true, index: true },
    achievement: { type: String, ref: "Achievement", required: true, index: true },
    // Олгосон багш (Lab 6). Автоматаар олгосон бол null.
    awardedBy: { type: String, ref: "User", default: null },
  },
  { timestamps: { createdAt: "awardedAt", updatedAt: false }, versionKey: false },
);

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

userAchievementSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
});

export const UserAchievement =
  mongoose.models.UserAchievement || mongoose.model("UserAchievement", userAchievementSchema);
