import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// ⭐ USER – Create Review (ORDER-BASED)
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    // ✅ Order must belong to user + delivered + contain product
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      status: "delivered",
      "items.product": productId,
    });

    if (!order) {
      return res
        .status(400)
        .json({ message: "You can review only after delivery" });
    }

    // ❌ Prevent duplicate review for SAME ORDER
    const existing = await Review.findOne({
      user: req.user._id,
      product: productId,
      orderId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Review already submitted for this order" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      orderId,
      rating,
      comment,
    });

    // Link review to product
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
