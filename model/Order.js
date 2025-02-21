const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      size: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "pending" }, // Статус заказа, например "pending", "completed"
});

module.exports = mongoose.model("Order", orderSchema, "orders");