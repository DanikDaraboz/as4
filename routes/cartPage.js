const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Product = require("../model/Product");

// Функция для получения уникальных категорий
async function getCategories() {
    return await Product.distinct("Category");
}

router.get("/cart", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const user = await User.findById(req.session.user.id).populate("Cart.product");
        if (!user) {
            return res.status(404).send("❌ Пользователь не найден");
        }

        const cartItems = user.Cart || []; // Предотвращаем ошибку, если корзина пустая
        const categories = await getCategories(); // Загружаем категории

        res.render("cart", { 
            title: "Your Cart", 
            cartItems, 
            Categories: categories, // 🔹 Передаем категории в шаблон
            user 
        });
    } catch (error) {
        console.error("Ошибка при загрузке корзины:", error);
        res.status(500).send("Ошибка сервера");
    }
});

module.exports = router;
