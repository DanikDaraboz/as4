const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  ID: { type: Number, required: true, unique: true },
  Name: { type: String, required: true },
  Category: { type: String, required: true },
  Price: { type: Number, required: true },
  Image: { type: String, required: true }
});

module.exports = mongoose.model("Product", productSchema, "products");
