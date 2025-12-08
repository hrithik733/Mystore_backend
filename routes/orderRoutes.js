import express from "express";
import { protect, isSeller } from "../middleware/authMiddleware.js";
import { getSellerOrders, updateSellerOrder,getMyOrders } from "../controllers/orderController.js";

const router = express.Router();

router.get("/seller", protect, isSeller, getSellerOrders);

router.put("/seller/:id/status", protect, isSeller, updateSellerOrder);
router.get("/my", protect, getMyOrders);


export default router;
