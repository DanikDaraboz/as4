const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../model/User');

const router = express.Router();

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 📌 Страница регистрации
router.get('/register', (req, res) => {
  res.render('register');
});

// 📌 Обработка регистрации
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.send('❌ Email уже зарегистрирован.');
    }

    const user = new User({ email, password });
    await user.save();

    res.redirect('/login');
  } catch (err) {
    res.send('❌ Ошибка регистрации: ' + err.message);
  }
});

// 📌 Страница входа
router.get('/login', (req, res) => {
  res.render('login');
});

// 📌 Обработка входа
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.send('❌ Неправильный email или пароль.');
  if (user.isLocked) return res.redirect('/blocked');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.isLocked = true;
    }
    await user.save();
    return res.send('❌ Неправильный email или пароль.');
  }

  // Успешный вход
  user.failedLoginAttempts = 0;
  await user.save();
  req.session.user = { id: user._id, email: user.email };
  
  res.redirect('/dashboard');
});

// 📌 Страница сброса пароля
router.get('/reset-password', (req, res) => {
  res.render('reset-password');
});

// 📌 Отправка кода сброса пароля
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.send('❌ Email не найден.');

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = await bcrypt.hash(resetCode, 10);
  user.resetCodeExpires = Date.now() + 5 * 60 * 1000; // 5 минут
  await user.save();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔑 Код сброса пароля',
    text: `Ваш код сброса пароля: ${resetCode}`
  });

  res.redirect('/verify-reset-code?email=' + email);
});

// 📌 Страница подтверждения кода
router.get('/verify-reset-code', (req, res) => {
  res.render('verify-reset-code', { email: req.query.email });
});

// 📌 Проверка кода и смена пароля
router.post('/verify-reset-code', async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.resetCodeExpires || Date.now() > user.resetCodeExpires)
    return res.send('❌ Код истек или недействителен.');

  const isMatch = await bcrypt.compare(code, user.resetCode);
  if (!isMatch) return res.send('❌ Неверный код.');

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  await user.save();

  res.redirect('/login');
});

// 📌 Выход
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// 📌 Личный кабинет
router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('dashboard', { user: req.session.user });
});

// 📌 Заблокированный аккаунт
router.get('/blocked', (req, res) => {
  res.render('blocked');
});

module.exports = router;
