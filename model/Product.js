const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  ID: { type: Number, required: true, unique: true },
  Name: { type: String, required: true },
  Gender: { type: String, required: true },
  Category: { type: String, required: true },
  Price: { type: Number, required: true },
  Image: { type: String, required: true },
  sizes: [
    {
      size: { type: String, required: true }, // Например, "M4", "M4.5"
      quantity: { type: Number, required: true, default: 0 } // Количество товаров этого размера
    }
  ]
});

module.exports = mongoose.model("Product", productSchema, "products");
