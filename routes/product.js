const express = require("express");
const router = express.Router();
const Product = require("../model/Product"); // Подключаем модель продукта
const User = require("../model/User");
// Маршрут для отображения деталей продукта
router.get("/product/:id", async (req, res) => {
    try {
        const product = await Product.findOne({ ID: Number(req.params.id) });

        if (!product) {
            return res.status(404).render("error", { message: "Товар не найден" });
        }

        // Загружаем все категории (если они есть)
        const categories = await Product.distinct("category");

        res.render("product", { 
            title: product.name, 
            product,
            categories,
            favorites: res.locals.favorites
        });
    } catch (error) {
        console.error("Ошибка при получении товара:", error);
        res.status(500).render("error", { message: "Ошибка сервера" });
    }
});

module.exports = router;
