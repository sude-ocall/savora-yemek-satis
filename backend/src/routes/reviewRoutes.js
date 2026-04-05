import express from "express";
import { getReviews, addReview } from "../controllers/reviewController.js";
import { protectUser } from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

router.get("/:sellerId",              getReviews);
router.post("/:sellerId", protectUser, addReview);

export default router;