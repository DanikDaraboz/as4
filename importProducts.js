const mongoose = require("mongoose");
const Product = require("./model/Product");
const fs = require("fs");
require("dotenv").config();

// Подключение к MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const products = JSON.parse(fs.readFileSync("products.json", "utf-8"));

async function importData() {
  try {
    await Product.insertMany(products);
    console.log("✅ Данные успешно загружены!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Ошибка загрузки:", error);
    mongoose.connection.close();
  }
}

importData();
