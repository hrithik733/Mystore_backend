import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect, isSeller } from "../middleware/authMiddleware.js";
import {
  getAll,
  getOne,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from "../controllers/productController.js";


const router = express.Router();

router.get("/", getAll);
router.get("/my", protect, isSeller, getMyProducts);


router.get("/:id", getOne);

router.post("/", protect, isSeller, upload.array("images"), createProduct);

router.put("/:id", protect, isSeller, upload.array("images"), updateProduct);

router.delete("/:id", protect, isSeller, deleteProduct);


export default router;
