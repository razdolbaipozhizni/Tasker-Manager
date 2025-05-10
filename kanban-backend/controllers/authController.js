const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Генерация JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1) Проверка обязательных полей
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    // 2) Проверяем, нет ли уже пользователя с таким email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // 3) Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 4) Создаём пользователя
    const user = new User({ name, email, password: hash });
    await user.save();

    // 5) Отправляем ответ с токеном
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Проверка обязательных полей
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    // 2) Ищем пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Неверные данные' });
    }

    // 3) Сравниваем пароли
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверные данные' });
    }

    // 4) Всё ок, отправляем токен
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  // protect-мидлвэр уже подставил req.user без пароля
  res.json(req.user);
};
