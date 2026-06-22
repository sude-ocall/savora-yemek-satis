import Seller from "../models/sellerModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// SATICI KAYIT
export const createSeller = async (req, res) => {
  try {
    const { taxNumber, restaurantName, phone, email, password } = req.body;

    const exists = await Seller.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Bu e-posta adresi zaten kayıtlı." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await Seller.create({
      taxNumber,
      restaurantName,
      phone,
      email,
      password: hashedPassword
    });

    res.status(201).json({ id: seller._id, email: seller.email });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// SATICI GİRİŞ
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: "Geçersiz e-posta veya şifre." });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz e-posta veya şifre." });
    }

    const token = jwt.sign(
      { id: seller._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      seller: {
        id: seller._id,
        email: seller.email,
        phone: seller.phone || "",
        restaurantName: seller.restaurantName
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// TÜM SATICILAR
export const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// 🔵 UPDATE SELLER PROFILE
export const updateSellerProfile = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const seller = await Seller.findByIdAndUpdate(
      req.seller._id,
      { email, phone },
      { new: true }
    ).select("-password");
    res.json({ message: "Profil güncellendi.", seller });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};