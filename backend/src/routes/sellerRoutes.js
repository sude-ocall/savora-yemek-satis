import express from "express";
import {
  createSeller,
  getSellers,
  loginSeller,
  updateSellerProfile
} from "../controllers/sellerController.js";
import { protectSeller } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register",          createSeller);
router.post("/login",             loginSeller);
router.get("/",                   getSellers);
router.put("/profile", protectSeller, updateSellerProfile);

export default router;