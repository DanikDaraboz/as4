const express = require("express");
const router = express.Router();
const Product = require("../model/Product");

// Эндпоинт для получения всех товаров
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Ошибка загрузки товаров" });
  }
});

module.exports = router;
