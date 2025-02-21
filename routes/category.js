const express = require("express");
const router = express.Router();
const Product = require("../model/Product");
const User = require("../model/User");

// Функция для получения списка категорий
async function getCategories() {
    return await Product.distinct("Category"); 
}

// Функция для загрузки избранных товаров
async function getFavorites(req) {
    if (!req.session.user) return [];
    const user = await User.findById(req.session.user.id);
    return user ? user.favorites : [];
}

// 📌 Страница всех товаров
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find();
    const categories = await getCategories();
    const favorites = await getFavorites(req);

    res.render("all", { products, Categories: categories, favorites });
  } catch (error) {
    res.status(500).send("Ошибка загрузки всех товаров");
  }
});

// 📌 Страница товаров для мужчин
router.get("/men", async (req, res) => {
  try {
    const menProducts = await Product.find({ Gender: "Men" });
    const categories = await getCategories();
    const favorites = await getFavorites(req);

    res.render("men", { title: "Men", products: menProducts, Categories: categories, favorites });
  } catch (error) {
    res.status(500).send("Ошибка загрузки товаров для мужчин");
  }
});

// 📌 Страница товаров для женщин
router.get("/women", async (req, res) => {
  try {
    const womenProducts = await Product.find({ Gender: "Women" });
    const categories = await getCategories();
    const favorites = await getFavorites(req);

    res.render("women", { title: "Women", products: womenProducts, Categories: categories, favorites });
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
    const favorites = await getFavorites(req);

    res.render("category", { category: categoryName, products, Categories: categories, favorites });
  } catch (error) {
    res.status(500).send("Ошибка загрузки товаров категории");
  }
});

module.exports = router;
