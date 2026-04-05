import Seller from "../models/sellerModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// 🟢 SELLER REGISTER
export const createSeller = async (req, res) => {
    try {
        const { taxNumber, restaurantName, phone, email, password } = req.body;

        const exists = await Seller.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Seller already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const seller = await Seller.create({
            taxNumber,
            restaurantName,
            phone,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            id: seller._id,
            email: seller.email
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🟢 SELLER LOGIN
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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
        restaurantName: seller.restaurantName
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔵 GET ALL SELLERS
export const getSellers = async (req, res) => {
    try {
        const sellers = await Seller.find();
        res.json(sellers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};