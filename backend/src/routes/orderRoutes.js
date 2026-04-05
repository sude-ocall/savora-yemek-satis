import express from "express";
import {
  createOrder,
  getUserOrders,
  cancelOrder,
  updateOrderStatus,
  getSellerOrders
} from "../controllers/orderController.js";

import { protectUser } from "../middlewares/userAuthMiddleware.js";
import { protectSeller } from "../middlewares/authMiddleware.js";

const router = express.Router();

// user
router.post("/", protectUser, createOrder);
router.get("/", protectUser, getUserOrders);
router.delete("/:id", protectUser, cancelOrder);
router.get("/seller", protectSeller, getSellerOrders);

// seller
router.put("/:id/status", protectSeller, updateOrderStatus);

export default router;