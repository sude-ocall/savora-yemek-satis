import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// ===================== REGISTER =====================
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Bu e-posta adresi zaten kayıtlı." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Hesap başarıyla oluşturuldu.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};


// ===================== LOGIN =====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "E-posta veya şifre hatalı." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "E-posta veya şifre hatalı." });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Giriş başarılı.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || ""
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== GET PROFILE =====================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    res.json({
      message: "Profil bilgileri alındı.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        addresses: user.addresses || [],
        creditCards: user.creditCards || [],
        orders: user.orders || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== UPDATE PROFILE =====================
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profil güncellendi.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || ""
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== UPDATE PASSWORD =====================
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mevcut şifre hatalı." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Şifre başarıyla güncellendi." });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== DELETE USER =====================
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Hesap silindi." });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== ADD ADDRESS =====================
export const addAddress = async (req, res) => {
  try {
    const { title, addressLine, city, district } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addresses: { title: title || "", addressLine, city, district } } },
      { new: true }
    ).select("-password");

    res.json({ message: "Adres eklendi.", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== DELETE ADDRESS =====================
export const deleteAddress = async (req, res) => {
  try {
    const { index } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    user.addresses.splice(Number(index), 1);
    await user.save();

    res.json({ message: "Adres silindi.", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== ADD CREDIT CARD =====================
export const addCreditCard = async (req, res) => {
  try {
    const { cardHash, last4, expiryDate } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { creditCards: { cardHash, last4, expiryDate } } },
      { new: true }
    ).select("-password");

    res.json({ message: "Kart eklendi.", creditCards: user.creditCards });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== DELETE CREDIT CARD =====================
export const deleteCreditCard = async (req, res) => {
  try {
    const { index } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    user.creditCards.splice(Number(index), 1);
    await user.save();

    res.json({ message: "Kart silindi.", creditCards: user.creditCards });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};