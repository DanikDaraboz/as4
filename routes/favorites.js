const express = require("express");
const router = express.Router();
const User = require("../model/User");
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/authMiddleware");

// Добавить или удалить из избранного
router.put("/:productId", authMiddleware, async (req, res) => {
    try {
        const userId = req.session.user.id; // Берём ID авторизованного пользователя
        const { productId } = req.params;

        // Проверяем, является ли productId валидным ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "❌ Некорректный ID товара" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "❌ Пользователь не найден" });

        const productObjectId = new mongoose.Types.ObjectId(productId);
        let isFavorite = false;

        // Проверяем, есть ли товар в избранном
        if (user.favorites.some(id => id.toString() === productId)) {
            // Удаляем товар из избранного
            user.favorites = user.favorites.filter(id => id.toString() !== productId);
        } else {
            // Добавляем товар в избранное
            user.favorites.push(productObjectId);
            isFavorite = true;
        }

        await user.save();
        res.json({ favorite: isFavorite });
    } catch (error) {
        console.error("Ошибка при добавлении в избранное:", error);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});
// Получить список избранных товаров
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.session.user?.id; // Проверяем, есть ли пользователь в сессии
        if (!userId) return res.status(401).json({ message: "❌ Требуется авторизация" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "❌ Пользователь не найден" });

        res.json(user.favorites || []);
    } catch (error) {
        console.error("Ошибка при получении избранных товаров:", error);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});



module.exports = router;
