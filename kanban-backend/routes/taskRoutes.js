// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  getArchivedTasks,
  getDeletedTasks,
  archiveTask,
  restoreTask,
  softDeleteTask,
  permanentDeleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// GET    /api/tasks/projects/:projectId/tasks (можно оставить публичным или защитить при необходимости)
router.get('/projects/:projectId/tasks', protect, getTasksByProject);

// Применяем защиту ко всем оставшимся маршрутам
router.use(protect);

// POST   /api/tasks
router.post('/', createTask);

// получить архивированные задачи
router.get('/archived/:projectId', getArchivedTasks);

// получить мягко-удалённые
router.get('/deleted/:projectId', getDeletedTasks);

// изменить задачу
router.put('/:id', updateTask);

// перенести в архив
router.put('/:id/archive', archiveTask);

// восстановить задачу
router.put('/:id/restore', restoreTask);

// мягко удалить
router.put('/:id/delete', softDeleteTask);

// окончательно удалить
router.delete('/:id', permanentDeleteTask);

module.exports = router;