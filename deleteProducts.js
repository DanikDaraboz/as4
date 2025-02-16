const mongoose = require("mongoose");
const Product = require("./model/Product");
const fs = require("fs");
require("dotenv").config();

// Подключение к MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


async function clearProducts() {
    await Product.deleteMany({});
    console.log("✅ Коллекция `products` очищена.");
    mongoose.disconnect();
  }
  
  clearProducts();