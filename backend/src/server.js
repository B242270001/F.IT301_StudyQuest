import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./db.js";
import { seedUsers } from "./store/users.js";

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  await connectDB(process.env.MONGODB_URI);
  if (await seedUsers()) {
    console.log("MongoDB хоосон байсан тул анхны хэрэглэгчдийг үүсгэлээ");
  }
  app.listen(PORT, () => {
    console.log(`StudyQuest API listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Сервер асаахад алдаа гарлаа:", err.message);
  process.exit(1);
});
