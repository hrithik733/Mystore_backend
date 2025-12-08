import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// PUBLIC (Seller & Users fetch categories)
router.get("/", getCategories);

// ADMIN ONLY
router.post("/", protect, isAdmin, createCategory);
router.put("/:id", protect, isAdmin, updateCategory);
router.delete("/:id", protect, isAdmin, deleteCategory);

export default router;
