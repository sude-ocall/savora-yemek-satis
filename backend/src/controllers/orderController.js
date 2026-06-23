import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { sendOrderNotification, sendOrderStatusUpdate } from "../services/rabbitmqService.js";
import { cacheOrder, getCachedOrder, invalidateOrderCache, cacheUserOrders, getCachedUserOrders, invalidateUserOrdersCache } from "../services/redisService.js";

export const createOrder = async (req, res) => {
  try {
    console.log("🛒 Yeni sipariş isteği geldi:", req.body);
    const { menu } = req.body;

    if (!menu || menu.length === 0) {
      console.log("❌ Hata: Sepet boş.");
      return res.status(400).json({ message: "Sepet boş." });
    }

    const products = await Product.find({
      _id: { $in: menu.map(m => m.productId) }
    });

    if (products.length === 0) {
      console.log("❌ Hata: Ürünler bulunamadı.");
      return res.status(400).json({ message: "Ürünler bulunamadı." });
    }

    const restaurantId = products[0].sellerId.toString();
    const isValid = products.every(p => p.sellerId.toString() === restaurantId);

    if (!isValid) {
      console.log("❌ Hata: Farklı restoranlardan ürün eklenemez.");
      return res.status(400).json({ message: "Farklı restoranlardan ürün eklenemez." });
    }

    // ─── Toplam Tutar Hesapla ───────────────────────────────────────────────
    const productMap = {};
    products.forEach(p => { productMap[p._id.toString()] = p.price || 0; });
    const totalAmount = menu.reduce((sum, item) => {
      const unitPrice = productMap[item.productId] || 0;
      return sum + unitPrice * (item.quantity || 1);
    }, 0);

    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      menu,
      totalAmount
    });

    console.log("✅ Sipariş DB'ye kaydedildi:", order._id);

    // RabbitMQ: Yeni sipariş bildirimi gönder
    sendOrderNotification(order).catch(() => {});

    // Redis: Kullanıcı sipariş listesi cache'ini temizle
    invalidateUserOrdersCache(req.user._id.toString()).catch(() => {});

    res.status(201).json(order);

  } catch (error) {
    console.error("❌ Sipariş oluşturma hatası:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// USER ORDER LIST
export const getUserOrders = async (req, res) => {
  try {
    // Redis: Önce cache'den kontrol et
    const cached = await getCachedUserOrders(req.user._id.toString());
    if (cached) return res.json(cached);

    const orders = await Order.find({ userId: req.user._id })
      .populate("menu.productId")
      .populate("restaurantId");

    // Redis: Sonucu cache'e yaz
    cacheUserOrders(req.user._id.toString(), orders).catch(() => {});

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ORDER BY ID
export const getOrderById = async (req, res) => {
  try {
    // Redis: Önce cache'den kontrol et
    const cached = await getCachedOrder(req.params.id);
    if (cached && cached.userId?.toString() === req.user._id.toString()) {
      return res.json(cached);
    }

    const order = await Order.findById(req.params.id)
      .populate("menu.productId")
      .populate("restaurantId");

    if (!order) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Yetkiniz yok." });
    }

    // Redis: Sonucu cache'e yaz
    cacheOrder(req.params.id, order).catch(() => {});

    res.json(order);

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

    order.status = "cancelled";
    await order.save(); // deleteOne yerine iptal edildi olarak güncelledik ki restoran görebilsin

    // RabbitMQ: İptal durumu bildirimi
    sendOrderStatusUpdate(order._id, "cancelled").catch(() => {});

    // Redis: Cache'i temizle
    invalidateOrderCache(order._id.toString()).catch(() => {});
    invalidateUserOrdersCache(order.userId.toString()).catch(() => {});

    res.json({ message: "Sipariş iptal edildi." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Geçerli Durum Geçişleri (RBAC + Transition Validation) ──────────────────
const VALID_TRANSITIONS = {
  new:        ["preparing", "cancelled"],
  preparing:  ["on_the_way", "cancelled"],
  on_the_way: ["completed"],
  completed:  [],
  cancelled:  []
};

// RESTAURANT STATUS UPDATE
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Yeni durum belirtilmedi." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Sipariş bulunamadı." });
    }

    if (order.restaurantId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Yetkiniz yok." });
    }

    // ─── Geçersiz durum geçişi kontrolü ─────────────────────────────────────
    const allowedNext = VALID_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: `Geçersiz durum geçişi: '${order.status}' → '${status}'. İzin verilen geçişler: ${allowedNext.join(", ") || "yok"}.`
      });
    }

    order.status = status;
    await order.save();

    // RabbitMQ: Durum güncelleme bildirimi
    sendOrderStatusUpdate(order._id, status).catch(() => {});

    // Redis: Cache'i temizle
    invalidateOrderCache(req.params.id).catch(() => {});
    invalidateUserOrdersCache(order.userId.toString()).catch(() => {});

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