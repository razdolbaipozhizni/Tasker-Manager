const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  shareProject,
  unshareProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Все маршруты защищены — только авторизованные пользователи
router.use(protect);

// POST   /api/projects           — создать проект
router.post('/', createProject);

// GET    /api/projects           — список проектов пользователя
router.get('/', getProjects);

// GET    /api/projects/:id       — дескриптор проекта
router.get('/:id', getProjectById);

// PUT    /api/projects/:id       — редактировать (владелец)
router.put('/:id', updateProject);

// DELETE /api/projects/:id       — удалить проект (владелец)
router.delete('/:id', deleteProject);

// PUT    /api/projects/:id/share    — добавить участника
router.put('/:id/share', shareProject);

// PUT    /api/projects/:id/unshare  — убрать участника
router.put('/:id/unshare', unshareProject);

module.exports = router;
