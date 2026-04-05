import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const createOrder = async (req, res) => {
  try {
    const { menu } = req.body;

    if (!menu || menu.length === 0) {
      return res.status(400).json({ message: "Menu is empty" });
    }

    // ürünleri çek
    const products = await Product.find({
      _id: { $in: menu.map(m => m.productId) }
    });

    if (products.length === 0) {
      return res.status(400).json({ message: "Products not found" });
    }

    // restaurant kontrol (tek restaurant kuralı)
    const restaurantId = products[0].sellerId.toString();

    const isValid = products.every(
      p => p.sellerId.toString() === restaurantId
    );

    if (!isValid) {
      return res.status(400).json({ message: "Multiple restaurants not allowed" });
    }

    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      menu
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//USER ORDER LİST
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("menu.productId")
      .populate("restaurantId");

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//NEW ORDER CANCEL
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (order.status !== "new") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    await order.deleteOne();

    res.json({ message: "Order cancelled" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//RESTAURANT STATUS UPDATE
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // restaurant kontrol
    if (order.restaurantId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    order.status = status;
    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSellerOrders = async (req, res) => {
  const orders = await Order.find({ restaurantId: req.seller._id }).populate("userId", "name phone").populate("menu.productId");
  res.json(orders);
};