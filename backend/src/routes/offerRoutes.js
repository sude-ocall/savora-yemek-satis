import express from "express";

import {
  createOfferRequest,
  getOpenOffers,
  addRestaurantOffer,
  getUserOffers,
  acceptOffer
} from "../controllers/offerController.js";

import { protectUser } from "../middlewares/userAuthMiddleware.js";
import { protectSeller } from "../middlewares/authMiddleware.js";

const router = express.Router();

// USER
router.post("/", protectUser, createOfferRequest);
router.get("/my", protectUser, getUserOffers);
router.post("/accept", protectUser, acceptOffer);

// SELLER
router.get("/open", protectSeller, getOpenOffers);
router.post("/:offerId", protectSeller, addRestaurantOffer);

export default router;