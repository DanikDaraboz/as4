const express = require("express");
const router = express.Router();
const User = require("../model/User");
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/authMiddleware"); // Проверка авторизации

// Получить список избранных товаров пользователя
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.status(404).json({ message: "❌ Пользователь не найден" });

        res.json(user.favorites || []);
    } catch (error) {
        console.error("Ошибка загрузки избранного:", error);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});

// Добавить товар в избранное
router.put("/:productId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.status(404).json({ message: "❌ Пользователь не найден" });

        const { productId } = req.params;

        if (!user.favorites.includes(productId)) {
            user.favorites.push(productId);
            await user.save();
        }

        res.json({ message: "⭐ Товар добавлен в избранное", favorites: user.favorites });
    } catch (error) {
        console.error("Ошибка при добавлении в избранное:", error);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});

// Удалить товар из избранного
router.delete("/:productId", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.status(404).json({ message: "❌ Пользователь не найден" });

        const { productId } = req.params;
        user.favorites = user.favorites.filter(id => id !== productId);
        await user.save();

        res.json({ message: "❌ Товар удалён из избранного", favorites: user.favorites });
    } catch (error) {
        console.error("Ошибка при удалении из избранного:", error);
        res.status(500).json({ message: "❌ Ошибка сервера" });
    }
});

module.exports = router;
