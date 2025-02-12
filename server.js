require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');

const app = express();

// Подключение к MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Подключено к MongoDB Atlas'))
  .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 } // 1 час
}));

// Передача данных пользователя в шаблоны
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Подключение маршрутов
app.use('/', authRoutes);

// Запуск сервера
app.listen(3000, () => console.log('🚀 Сервер запущен на http://localhost:3000'));
