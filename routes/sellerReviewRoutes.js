import express from "express";
import { protect, isSeller } from "../middleware/authMiddleware.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

const router = express.Router();

// ⭐ SELLER — Get reviews for seller's products
router.get("/", protect, isSeller, async (req, res) => {
  try {
    // 1️⃣ Find products owned by seller
    const sellerProducts = await Product.find({ seller: req.user._id }).select("_id");

    if (sellerProducts.length === 0) {
      return res.json([]);   // seller has no products → no reviews
    }

    const productIds = sellerProducts.map((p) => p._id);

    // 2️⃣ Find reviews where product is one of sellerProducts
    const reviews = await Review.find({
      product: { $in: productIds }
    })
      .populate("product", "title images")
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("SELLER REVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to load seller reviews" });
  }
});

export default router;
