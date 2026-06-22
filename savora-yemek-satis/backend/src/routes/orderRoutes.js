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

// SELLER (önce tanımlanmalı - yoksa /:id ile çakışır)
router.get("/seller", protectSeller, getSellerOrders);
router.put("/:id/status", protectSeller, updateOrderStatus);

// USER
router.post("/", protectUser, createOrder);
router.get("/", protectUser, getUserOrders);
router.delete("/:id", protectUser, cancelOrder);

export default router;