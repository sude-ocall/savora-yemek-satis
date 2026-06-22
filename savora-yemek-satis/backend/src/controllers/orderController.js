import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const createOrder = async (req, res) => {
  try {
    const { menu } = req.body;

    if (!menu || menu.length === 0) {
      return res.status(400).json({ message: "Sepet boş." });
    }

    const products = await Product.find({
      _id: { $in: menu.map(m => m.productId) }
    });

    if (products.length === 0) {
      return res.status(400).json({ message: "Ürünler bulunamadı." });
    }

    const restaurantId = products[0].sellerId.toString();
    const isValid = products.every(p => p.sellerId.toString() === restaurantId);

    if (!isValid) {
      return res.status(400).json({ message: "Farklı restoranlardan ürün eklenemez." });
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

// USER ORDER LIST
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

// CANCEL ORDER (sadece "new" durumdakiler)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Yetkiniz yok." });
    }

    if (order.status !== "new") {
      return res.status(400).json({ message: "Yalnızca 'Yeni' durumdaki siparişler iptal edilebilir." });
    }

    await order.deleteOne();

    res.json({ message: "Sipariş iptal edildi." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESTAURANT STATUS UPDATE
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    if (order.restaurantId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Yetkiniz yok." });
    }

    order.status = status;
    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SELLER ORDER LIST
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.seller._id })
      .populate("userId", "name phone")
      .populate("menu.productId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};