const Project = require('../models/Project');
const Task    = require('../models/Task');
const User = require('../models/User');

// @desc    Создать новый проект
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { name, description, memberEmails = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Название проекта обязательно' });
    }

    // Ищем пользователей по email
    const users = await User.find({ email: { $in: memberEmails } });
    const foundEmails = users.map((u) => u.email);
    const notFound = memberEmails.filter((email) => !foundEmails.includes(email));

    if (notFound.length > 0) {
      return res.status(400).json({
        message: `Следующие пользователи не найдены: ${notFound.join(', ')}`
      });
    }

    const memberIds = users.map((u) => u._id);

    const project = new Project({
      name,
      description,
      owner: req.user._id,
      members: memberIds,
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка создания проекта' });
  }
};

// @desc    Получить все проекты текущего пользователя
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    // Проекты, где пользователь — владелец или участник
    const projects = await Project.find({
      $or: [{ owner: userId },{ members: userId }]
    })
    .populate("owner", "name email") 
    .populate("lastEditedBy", "name email") 
    .populate("members", "name email") // ← добавлено
    .sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка получения проектов' });
  }
};

// @desc    Получить проект по ID (если в нём участвует текущий пользователь)
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }
    const userId = req.user._id.toString();
    if (
      project.owner._id.toString() !== userId &&
      !project.members.some(m => m._id.toString() === userId)
    ) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка получения проекта' });
  }
};

// @desc    Обновить информацию проекта (владелец только)
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Только владелец может редактировать' });
    }
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    project.lastEditedBy = req.user._id;
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('members', 'name email')
      .populate('owner', 'name email')
      .populate('lastEditedBy', 'name email');

    res.json(updatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка обновления проекта' });
  }
};

// @desc    Удалить проект вместе с его задачами (владелец только)
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Только владелец может удалять' });
    }

    // Удаляем все задачи этого проекта
    await Task.deleteMany({ project: project._id });

    // Удаляем сам проект
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Проект и все его задачи удалены' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка удаления проекта' });
  }
};

// @desc    Добавить участника в проект по email (может сделать только владелец )
// @route   PUT /api/projects/:id/share
// @access  Private
exports.shareProject = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Только владелец может делиться' });
    }
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'Пользователь уже в проекте' });
    }
    project.members.push(userToAdd._id);
    await project.save();

    // Подгружаем для ответа имена
    const updatedProject = await Project.findById(project._id).populate('members', 'name email');
    res.json(updatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка шаринга проекта' });
  }
};

// @desc    Убрать участника из проекта (владелец только)
// @route   PUT /api/projects/:id/unshare
// @access  Private
exports.unshareProject = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Только владелец может удалять участников' });
    }
    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();

    const updatedProject = await Project.findById(project._id).populate('members', 'name email');
    res.json(updatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка удаления участника' });
  }
};
