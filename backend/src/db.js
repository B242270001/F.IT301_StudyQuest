// TASK-01 (Lab 5): MongoDB холболт.
// Connection string-ийг заавал `MONGODB_URI` орчны хувьсагчаас авна.
import mongoose from "mongoose";

export async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error(
      "MONGODB_URI орчны хувьсагч тохируулаагүй байна (жишээ: mongodb://127.0.0.1:27017/studyquest)",
    );
  }
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
