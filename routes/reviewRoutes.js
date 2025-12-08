import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  createReview,
  getProductReviews,
  adminGetAllReviews,
  adminDeleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// USER
router.post("/", protect, createReview);
router.get("/:productId", getProductReviews);

// ADMIN
router.get("/", protect, isAdmin, adminGetAllReviews);
router.delete("/:id", protect, isAdmin, adminDeleteReview);

export default router;
