import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  deleteUser,
  addAddress,
  deleteAddress,
  addCreditCard,
  deleteCreditCard
} from "../controllers/userController.js";
import { protectUser } from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login",    loginUser);

// Protected — profile
router.get("/profile",    protectUser, getUserProfile);
router.put("/profile",    protectUser, updateUserProfile);
router.put("/password",   protectUser, updatePassword);
router.delete("/account", protectUser, deleteUser);

// Protected — addresses
router.post("/addresses",        protectUser, addAddress);
router.delete("/addresses/:index", protectUser, deleteAddress);

// Protected — cards
router.post("/cards",        protectUser, addCreditCard);
router.delete("/cards/:index", protectUser, deleteCreditCard);

export default router;