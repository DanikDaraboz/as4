const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Product = require("../model/Product");


async function getCategories() {
  return await Product.distinct("Category"); // Получает список всех категорий
}
// 📌 Получение избранных товаров текущего пользователя
router.get("/wishlist", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login"); // 🔒 Перенаправляем неавторизованных пользователей
        }

        // Находим пользователя и загружаем его избранные товары
        const user = await User.findById(req.session.user.id).populate("favorites");
        if (!user) {
            return res.status(404).send("❌ Пользователь не найден");
        }

        const favorites = user.favorites || []; // Предотвращаем ошибку, если избранных товаров нет
        const categories = await getCategories();; // Уникальные категории товаров

        res.render("favorites", { 
            title: "Favorite Items", 
            favorites, 
            Categories:categories, 
            user // 🔹 Передаем пользователя, чтобы проверять его `favorites`
        });
    } catch (error) {
        console.error("Ошибка при загрузке избранных товаров:", error);
        res.status(500).send("Ошибка сервера");
    }
});

module.exports = router;
