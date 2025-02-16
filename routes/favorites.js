const express = require("express");
const router = express.Router();
const User = require("../model/User");
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/authMiddleware"); // Подключаем middleware

// Добавить или удалить из избранного
router.put("/:productId", authMiddleware, async (req, res) => {
    try {
        const userId = req.session.user.id; // Получаем ID авторизованного пользователя
        const { productId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "❌ Пользователь не найден" });

        const productObjectId = new mongoose.Types.ObjectId(productId);
        let isFavorite = false;

        if (user.favorites.some(id => id.equals(productObjectId))) {
            user.favorites = user.favorites.filter(id => !id.equals(productObjectId));
        } else {
            user.favorites.push(productObjectId);
            isFavorite = true;
        }

        await user.save();
        res.json({ Favorite: isFavorite });
    } catch (error) {
        console.error("Ошибка при добавлении в избранное:", error);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});

module.exports = router;
