import jwt from "jsonwebtoken";
import Seller from "../models/sellerModel.js";

export const protectSeller = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token, unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await Seller.findById(decoded.id).select("-password");

    if (!seller) {
      return res.status(401).json({ message: "Seller not found" });
    }

    req.seller = seller;
    next();

  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};