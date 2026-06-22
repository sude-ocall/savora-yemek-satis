import express from "express";

import {
  createOfferRequest,
  getOpenOffers,
  addRestaurantOffer,
  getUserOffers,
  acceptOffer,
  getRegionalOffers,
  updateRestaurantOffer,
  deleteOfferRequest
} from "../controllers/offerController.js";

import { protectUser } from "../middlewares/userAuthMiddleware.js";
import { protectSeller } from "../middlewares/authMiddleware.js";

const router = express.Router();

// USER
router.post("/", protectUser, createOfferRequest);
router.get("/my", protectUser, getUserOffers);
router.post("/accept", protectUser, acceptOffer);
router.get("/open", protectUser, getOpenOffers);
router.get("/regional", protectUser, getRegionalOffers);
router.delete("/:offerId", protectUser, deleteOfferRequest);

// SELLER
router.post("/:offerId", protectSeller, addRestaurantOffer);
router.put("/:offerId/offer", protectSeller, updateRestaurantOffer);

export default router;