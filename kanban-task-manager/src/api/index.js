// /api/index.js  (или просто src/index.js в бэке)
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// ваши роутеры
import authRouter    from "./routes/auth.js";
import projectRouter from "./routes/projects.js";
import taskRouter    from "./routes/tasks.js";

dotenv.config();

const app = express();

// 1) CORS — разрешаем фронту делать запросы сюда
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// 2) Парсинг JSON — без этого req.body будет undefined
app.use(express.json());

// 3) Все роуты «под» префиксом /api
app.use("/api/auth",    authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks",    taskRouter);

// 4) Подключаем MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✔️ MongoDB Connected");
    // 5) Стартуем сервер
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
