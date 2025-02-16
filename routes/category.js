const express = require("express");
const router = express.Router();
const Product = require("../model/Product");

// Функция для получения списка категорий
async function getCategories() {
    return await Product.distinct("Category"); 
}

// 📌 Страница всех товаров
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find();
    const categories = await getCategories();
    res.render("all", { products, Categories: categories });
  } catch (error) {
    res.status(500).send("Ошибка загрузки всех товаров");
  }
});

// 📌 Страница товаров для мужчин
router.get("/men", async (req, res) => {
  try {
    const menProducts = await Product.find({ Gender: "Men" });
    const categories = await getCategories();
    res.render("Men", {title: "Men",  products: menProducts, Categories: categories });
  } catch (error) {
    res.status(500).send("Ошибка загрузки товаров для мужчин");
  }
});

// 📌 Страница товаров для женщин
router.get("/women", async (req, res) => {
  try {
    const womenProducts = await Product.find({ Gender: "Women" });
    const categories = await getCategories();
    res.render("women", { title: "Women", products: womenProducts, Categories: categories });
  } catch (error) {
    res.status(500).send("Ошибка загрузки товаров для женщин");
  }
});

// 📌 Страница товаров по категориям
router.get("/category/:category", async (req, res) => {
  try {
    const categoryName = req.params.category; 
    const products = await Product.find({ Category: categoryName }); 
    const categories = await getCategories();
    res.render("category", { category: categoryName, products, Categories: categories });
  } catch (error) {
    res.status(500).send("Ошибка загрузки товаров категории");
  }
});

module.exports = router;
