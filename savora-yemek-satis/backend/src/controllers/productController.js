import Product from "../models/productModel.js";
import Seller from "../models/sellerModel.js";


// ➕ CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, category, price, description, imgURL } = req.body;

    const product = await Product.create({
      sellerId: req.seller._id,
      name,
      category,
      price,
      description,
      imgURL
    });

    await Seller.findByIdAndUpdate(
      req.seller._id,
      { $push: { products: product._id } }
    );

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("sellerId", "restaurantName email");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("sellerId");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Seller.findByIdAndUpdate(
      req.seller._id,
      { $pull: { products: product._id } }
    );

    await product.deleteOne();

    res.json({ message: "Product deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};