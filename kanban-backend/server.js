// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes    = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes    = require('./routes/taskRoutes');

const app = express();

// 1) Подключаемся к базе
connectDB();

// 2) Общие middleware
app.use(cors());
app.use(express.json());

// 3) Маршруты
app.use('/api/auth',    authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',    taskRoutes);

// 4) Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});