// controllers/taskController.js
const Task    = require('../models/Task');
const Project = require('../models/Project');

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { projectId, title, description, dueDate, status, urgent, assignedTo = [] } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ message: 'projectId и title обязательны' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Создание задачи
    const task = new Task({
      project,
      title,
      description,
      dueDate,
      status,
      urgent,
      previousStatus: status,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      assignedTo
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json(populatedTask);

  } catch (err) {
    console.error('Ошибка в createTask:', err);
    res.status(500).json({ message: 'Ошибка создания задачи' });
  }
};


// GET /api/tasks/projects/:projectId/tasks
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // Проверяем права, если есть авторизованный пользователь
    if (req.user && req.user._id) {
      const userId   = req.user._id.toString();
      const isOwner  = project.owner.toString() === userId;
      const isMember = project.members.some(m => m.toString() === userId);
      if (!isOwner && !isMember) {
        return res.status(403).json({ message: 'Доступ запрещён' });
      }
    } else {
      return res.status(401).json({ message: 'Требуется авторизация' });
      // console.warn('getTasksByProject: req.user не определён, пропускаем проверку прав.');
    }

    const tasks = await Task.find({ project: projectId, isDeleted: false, isArchived: false })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('assignedTo', 'name email') 
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Ошибка в getTasksByProject:', err);
    res.status(500).json({ message: 'Ошибка получения задач' });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, status, urgent, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Задача не найдена' });

    // Права через req.user
    const project = await Project.findById(task.project);
    const userId  = req.user._id.toString();
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(m => m.toString() === userId);
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    if (title       !== undefined) task.title       = title;
    if (description !== undefined) task.description = description;
    if (dueDate     !== undefined) task.dueDate     = dueDate;
    if (status      !== undefined) task.status      = status;
    if (urgent      !== undefined) task.urgent      = urgent;
    if (assignedTo  !== undefined) task.assignedTo  = assignedTo;

    task.updatedBy = req.user._id;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error('Ошибка в updateTask:', err);
    res.status(500).json({ message: 'Ошибка обновления задачи' });
  }
};

// PUT /api/tasks/:id/archive
exports.archiveTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Задача не найдена' });

    task.previousStatus = task.status;
    task.isArchived = true;
    task.updatedBy = req.user._id;
    await task.save();


    res.json(task);
  } catch (err) {
    console.error('Ошибка в archiveTask:', err);
    res.status(500).json({ message: 'Ошибка архивации задачи' });
  }
};

// PUT /api/tasks/:id/delete  (мягкое удаление)
exports.softDeleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Задача не найдена' });

    task.previousStatus = task.status;
    task.isDeleted = true;
    task.updatedBy = req.user._id;
    await task.save();

    res.json({ message: 'Задача перенесена в корзину' });
  } catch (err) {
    console.error('Ошибка в softDeleteTask:', err);
    res.status(500).json({ message: 'Ошибка удаления задачи' });
  }
};

// PUT /api/tasks/:id/restore  (восстановление из корзины или архива)
exports.restoreTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Задача не найдена' });

       // восстанавливаем и из корзины, и из архива
    task.isDeleted  = false;
    task.isArchived = false;
    task.status = task.previousStatus || 'planned';
    task.previousStatus = undefined; // очистка поля
    task.updatedBy = req.user._id;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error('Ошибка в restoreTask:', err);
    res.status(500).json({ message: 'Ошибка восстановления задачи' });
  }
};

// GET /api/tasks/archived/:projectId
exports.getArchivedTasks = async (req, res) => {
  try {
       const tasks = await Task.find({
           project:    req.params.projectId,
           isDeleted:  false,
           isArchived: true
         })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Ошибка в getArchivedTasks:', err);
    res.status(500).json({ message: 'Ошибка получения архивных задач' });
  }
};

// GET /api/tasks/deleted/:projectId
exports.getDeletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      project:   req.params.projectId,
      isDeleted: true
    })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Ошибка в getDeletedTasks:', err);
    res.status(500).json({ message: 'Ошибка получения удалённых задач' });
  }
};

// DELETE /api/tasks/:id  (окончательное удаление)
exports.permanentDeleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Задача окончательно удалена' });
  } catch (err) {
    console.error('Ошибка в permanentDeleteTask:', err);
    res.status(500).json({ message: 'Ошибка при окончательном удалении' });
  }
};
