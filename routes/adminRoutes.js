import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { getAdminOrders } from "../controllers/orderController.js";
import {
  getUsers,
  approveSeller,
  deleteUser,
  banUser,
  unbanUser,
  allOrders,
  updateOrder,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/users", getUsers);
router.put("/user/:id/role", approveSeller);
router.delete("/user/:id", deleteUser);
router.put("/user/:id/ban", banUser);
router.put("/user/:id/unban", unbanUser);

router.get("/orders", allOrders);
router.put("/orders/:id/status", updateOrder);
router.get("/orders", protect, isAdmin, getAdminOrders);

export default router;
