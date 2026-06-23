import express from "express";
import {
  savePaymentMethod,
  getPaymentMethods,
  deletePaymentMethod
} from "../controllers/paymentController.js";
import { protectUser } from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

// POST /api/payments — Ödeme yöntemi kaydet
router.post("/", protectUser, savePaymentMethod);

// GET /api/payments — Kayıtlı ödeme yöntemlerini listele
router.get("/", protectUser, getPaymentMethods);

// DELETE /api/payments/:index — Kayıtlı ödeme yöntemini sil
router.delete("/:index", protectUser, deletePaymentMethod);

export default router;
