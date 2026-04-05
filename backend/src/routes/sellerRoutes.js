import express from "express";
import { createSeller, getSellers, loginSeller } from "../controllers/sellerController.js";

const router = express.Router();

router.post("/register", createSeller);
router.post("/login", loginSeller);
router.get("/", getSellers);

export default router;