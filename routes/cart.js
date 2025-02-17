const express = require("express");
const router = express.Router();
const User = require("../model/User");
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/authMiddleware");

// 📌 Добавить товар в корзину
router.put("/:productId", authMiddleware, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { productId } = req.params;
        const { size } = req.body;

        if (!size) {
            return res.status(400).json({ message: "⚠️ Please select a size!" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "❌ User not found" });

        const productObjectId = new mongoose.Types.ObjectId(productId);

        if (!user.Cart.some(item => item.product.equals(productObjectId))) {
            user.Cart.push({ product: productObjectId, size });
        }

        await user.save();
        res.json({ message: "✅ Item added to cart" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "❌ Server error" });
    }
});

// 📌 Получение корзины пользователя
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).populate("Cart.product");
        if (!user) return res.status(404).json({ message: "❌ User not found" });

        res.json(user.Cart);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "❌ Server error" });
    }
});

module.exports = router;
