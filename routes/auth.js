const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../model/User');
const Product = require('../model/Product');
const Order = require('../model/Order'); // модель заказов
const router = express.Router();

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
async function getCategories() {
  return await Product.distinct("Category"); // Получает список всех категорий
}

// 📌 Главная страница


router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    const categories = await getCategories();
    
    let favorites = [];
    if (req.user) {
      const user = await User.findById(req.user._id);
      favorites = user.favorites.map(id => id.toString()); // Преобразуем ObjectId в строку
    }
    res.render("index", { products, Categories: categories, Favorites: favorites });
  } catch (error) {
    res.status(500).send("Ошибка загрузки товаров");
  }
});

router.get('/auth', (req, res) => res.render('auth'));
router.post('/auth', async (req, res) => {
  res.redirect('/auth');
});
// 📌 Регистрация
router.get('/register', (req, res) => res.render('register'));
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (await User.findOne({ email })) return res.send('❌ Email уже зарегистрирован.');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    res.send('❌ Ошибка регистрации: ' + err.message);
  }
});

// 📌 Вход
router.get('/login', (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.send('❌ Неправильный email или пароль.');
  if (user.isLocked) return res.redirect('/blocked');
  console.log('Entered Password:', password);
  console.log('Hashed Password from DB:', user.password);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) user.isLocked = true;
    await user.save();
    return res.send('❌ Неправильный email или пароль.');
  }

  user.failedLoginAttempts = 0;
  await user.save();

  if (user.is2FAEnabled) {
    req.session.tempUser = { id: user._id, email: user.email };
    return res.redirect('/verify-otp');
  }

  req.session.user = { id: user._id, email: user.email };
  res.redirect('/dashboard');
});

// 📌 Восстановление пароля
router.get('/reset-password', (req, res) => res.render('reset-password'));
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send('❌ Email не найден.');

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = await bcrypt.hash(resetCode, 10);
  user.resetCodeExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔑 Код сброса пароля',
    text: `Ваш код сброса пароля: ${resetCode}`
  });

  res.redirect('/verify-reset-code?email=' + email);
});



router.get("/cart", async (req, res) => {
  try {
      if (!req.session.user) {
          return res.redirect("/login");
      }

      const user = await User.findById(req.session.user.id).populate("Cart.product");
      console.log(user.Cart);

      if (!user) {
          return res.status(404).send("❌ Пользователь не найден");
      }

      const cartItems = user.Cart || []; // Предотвращаем ошибку, если корзина пустая
      const products = cartItems.map(item => item.product); // Извлекаем товары
      const categories = await getCategories(); // Загружаем категории

      res.render("cart", { 
          title: "Your Cart", 
          cartItems, 
          products, // 🔹 Передаем products в шаблон
          Categories: categories,
          user 
      });
  } catch (error) {
      console.error("Ошибка при загрузке корзины:", error);
      res.status(500).send("Ошибка сервера");
  }
});


router.post("/buy", async (req, res) => {
  try {
      console.log("req.session.user:", req.session.user); // Логируем пользователя

      if (!req.session.user) {
          return res.status(401).json({ message: "❌ Пользователь не аутентифицирован" });
      }

      const userId = req.session.user.id;  
      console.log("userId:", userId); // Проверим, есть ли _id
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "❌ Пользователь не найден" });
      }
      if (!user || user.Cart.length === 0) {
          return res.status(400).json({ message: "Корзина пуста" });
      }

      let totalPrice = 0;
      let orderProducts = [];

      for (let item of user.Cart) {
          const product = await Product.findById(item.product._id);
          if (!product) continue;

          // Находим нужный размер в массиве sizes
          const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
          if (sizeIndex === -1 || product.sizes[sizeIndex].quantity <= 0) {
              return res.status(400).json({ message: `Размер ${item.size} у ${product.Name} закончился` });
          }

          // Уменьшаем количество на складе
          product.sizes[sizeIndex].quantity -= 1;
          await product.save();

          // Добавляем товар в заказ
          orderProducts.push({
              product: product._id,
              size: item.size,
              quantity: 1, // По умолчанию 1, можно менять при наличии количества в корзине
              price: product.Price,
          });

          // Считаем общую стоимость
          totalPrice += product.Price;
      }

      // Создаем заказ
      const newOrder = new Order({
          user: userId,
          products: orderProducts,
          totalPrice: totalPrice,
          status: "pending",
      });

      await newOrder.save();

      // Очищаем корзину пользователя
      await User.updateOne({ _id: userId }, { $set: { Cart: [] } });

      res.status(200).json({ message: "Покупка завершена, заказ создан!" });
  } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);
      res.status(500).json({ message: "Ошибка сервера" });
  }
});



router.post("/remove", async (req, res) => {
  const { productId, size } = req.body;
  
  if (!req.session.user) {
      return res.status(401).send("❌ Неавторизованный пользователь");
  }

  try {
      const user = await User.findById(req.session.user.id);
      if (!user) {
          return res.status(404).send("❌ Пользователь не найден");
      }

      // Находим товар в корзине и удаляем
      const productIndex = user.Cart.findIndex(item => 
          item.product.toString() === productId && item.size === size
      );

      if (productIndex === -1) {
          return res.status(404).send("❌ Товар не найден в корзине");
      }

      user.Cart.splice(productIndex, 1);  // Удаляем товар из корзины
      await user.save();

      res.status(200).send("✅ Товар успешно удален из корзины");
  } catch (error) {
      console.error("Ошибка при удалении товара:", error);
      res.status(500).send("❌ Ошибка сервера");
  }
});
router.post('/add-to-cart', (req, res) => {
  const { productId, size } = req.body;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  // Находим товар в базе данных (если требуется)
  Product.findById(productId, (err, product) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Ошибка при добавлении товара в корзину' });
    }

    const cartItem = {
      productId: product._id,
      name: product.Name,
      price: product.price,
      size: size,
      image: product.Image
    };

    // Добавляем товар в корзину
    req.session.cart.push(cartItem);

    res.json({ success: true });
  });
});
// Уменьшение количества товара в корзине
router.post('/cart/update-quantity', (req, res) => {
  const { productId, action } = req.body;

  if (req.session.cart) {
    const product = req.session.cart.find(item => item.productId == productId);
    if (product) {
      if (action === 'increase') {
        product.quantity++;
      } else if (action === 'decrease' && product.quantity > 1) {
        product.quantity--;
      }
    }
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Удаление товара из корзины
router.post('/cart/remove', (req, res) => {
  const { productId } = req.body;

  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.productId != productId);
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});







// 📌 Проверка кода сброса пароля
router.get('/verify-reset-code', (req, res) => {
  res.render('verify-reset-code', { email: req.query.email });
});
router.post('/verify-reset-code', async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.resetCodeExpires || Date.now() > user.resetCodeExpires)
    return res.send('❌ Код истек или недействителен.');

  const isMatch = await bcrypt.compare(code, user.resetCode);
  if (!isMatch) return res.send('❌ Неверный код.');

  user.password = newPassword;
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  await user.save();

  res.redirect('/login');
});


router.post('/verify-setup-2fa', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { otp } = req.body;
  const user = await User.findById(req.session.user.id);
  if (!user || !user.twoFASecret) return res.redirect('/setup-2fa');

  const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: otp,
      window: 1
  });

  if (!verified) {
      return res.send('❌ Неверный код. Попробуйте еще раз.');
  }

  // ✅ Если код верный, включаем 2FA
  user.is2FAEnabled = true;
  await user.save();

  res.redirect('/dashboard'); // Переход в личный кабинет после успешного включения 2FA
});


// 📌 Генерация QR-кода для 2FA
router.get('/setup-2fa', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const user = await User.findById(req.session.user.id);
  if (!user) return res.redirect('/login');

  const secret = speakeasy.generateSecret({ name: `MyApp (${user.email})` });
  user.twoFASecret = secret.base32;
  await user.save();
  console.log('Generated Secret:', secret.base32);
  console.log('User Secret from DB:', user.twoFASecret);
  qrcode.toDataURL(secret.otpauth_url, (err, qrCode) => {
    if (err) return res.send('Ошибка генерации QR-кода');
    res.render('setup-2fa', { qrCode, secret: secret.base32 }); // ✅ передаем qrCode
  });
});

// 📌 Проверка OTP-кода
router.get('/verify-otp', (req, res) => {
  if (!req.session.tempUser) return res.redirect('/login');
  res.render('verify-otp');
});
router.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;
  const tempUser = req.session.tempUser;
  if (!tempUser) return res.redirect('/login');

  const user = await User.findById(tempUser.id);
  if (!user) return res.redirect('/login');
  console.log('User Secret at Verification:', user.twoFASecret);
  console.log('OTP Entered:', otp);
  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: 'base32',
    token: otp,
    window: 2
  });

  if (!verified) return res.send('❌ Неверный OTP.');

  req.session.user = tempUser;
  delete req.session.tempUser;
  res.redirect('/dashboard');
});

// 📌 Отключение 2FA
router.post('/disable-2fa', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const user = await User.findById(req.session.user.id);
  if (!user) return res.redirect('/login');

  user.twoFASecret = undefined;
  user.is2FAEnabled = false;
  await user.save();

  res.redirect('/dashboard');
});

// 📌 Личный кабинет
router.get('/dashboard', async (req, res) => {
  const categories = await getCategories();
  if (!req.session.user) return res.redirect('/login');

  const user = await User.findById(req.session.user.id);
  res.render('dashboard', { user,Categories:categories });
});

// 📌 Заблокированный аккаунт
router.get('/blocked', (req, res) => res.render('blocked'));

// 📌 Выход
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
