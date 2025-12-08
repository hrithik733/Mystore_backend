import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// ⭐ USER – Create Review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // ✅ Just check: has this user ever ordered this product?
    const order = await Order.findOne({
      user: req.user._id,
      "items.product": productId,
      //  removed strict status check to avoid blocking
      // status: "delivered",
    });

    if (!order) {
      return res
        .status(400)
        .json({ message: "You cannot review this product" });
    }

    // Prevent duplicate review
    const existing = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
      orderId: order._id,
    });

    // ⭐ Link review to product.reviews[]
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
    });

    res.json(review);
  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ message: "Failed to create review" });
  }
};



// ⭐ USER – Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

// ⭐ ADMIN – List all reviews
export const adminGetAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product", "title")
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch {
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

// ⭐ ADMIN – Delete review
export const adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Remove review from product.reviews[]
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id },
    });

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete review" });
  }
};
