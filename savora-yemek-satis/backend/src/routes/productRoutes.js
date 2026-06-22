import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

import { protectSeller } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protectSeller, createProduct);
router.put("/:id", protectSeller, updateProduct);
router.delete("/:id", protectSeller, deleteProduct);

router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;