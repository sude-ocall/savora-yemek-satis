import { EventEmitter } from "events";

const mockQueue = new EventEmitter();
let isConnected = false;
const QUEUE_NAME = "order_notifications";

// ─── RabbitMQ Bağlantısı (MOCK) ──────────────────────────────────────────────
export const connectRabbitMQ = async () => {
  try {
    // Simüle edilmiş bağlantı gecikmesi
    await new Promise(resolve => setTimeout(resolve, 500));
    isConnected = true;
    console.log("✅ RabbitMQ bağlantısı kuruldu. Kuyruk:", QUEUE_NAME, "(In-Memory Mock)");
    return true;
  } catch (error) {
    console.error("❌ RabbitMQ bağlantı hatası:", error.message);
    return null;
  }
};

// ─── Sipariş Bildirim Mesajı Gönder ─────────────────────────────────────────
export const sendOrderNotification = async (orderData) => {
  try {
    if (!isConnected) {
      console.warn("⚠️ RabbitMQ kanalı mevcut değil, mesaj gönderilemedi.");
      return false;
    }

    const message = {
      type: "NEW_ORDER",
      orderId: orderData._id,
      userId: orderData.userId,
      restaurantId: orderData.restaurantId,
      itemCount: orderData.menu?.length || 0,
      timestamp: new Date().toISOString()
    };

    console.log("📨 Sipariş bildirimi kuyruğa gönderildi:", orderData._id);

    // Simüle edilmiş asenkron tüketim
    setTimeout(() => {
      mockQueue.emit(QUEUE_NAME, message);
    }, 500);

    return true;
  } catch (error) {
    console.error("❌ RabbitMQ mesaj gönderme hatası:", error.message);
    return false;
  }
};

// ─── Sipariş Durumu Güncelleme Mesajı ────────────────────────────────────────
export const sendOrderStatusUpdate = async (orderId, newStatus) => {
  try {
    if (!isConnected) return false;

    const message = {
      type: "ORDER_STATUS_UPDATE",
      orderId,
      newStatus,
      timestamp: new Date().toISOString()
    };

    console.log(`📨 Sipariş durumu güncellendi: ${orderId} → ${newStatus}`);

    // Simüle edilmiş asenkron tüketim
    setTimeout(() => {
      mockQueue.emit(QUEUE_NAME, message);
    }, 500);

    return true;
  } catch (error) {
    console.error("❌ Durum güncelleme mesajı hatası:", error.message);
    return false;
  }
};

// ─── Kuyruktan Mesaj Tüketici (Consumer) ────────────────────────────────────
export const startOrderConsumer = async () => {
  try {
    if (!isConnected) return;

    mockQueue.on(QUEUE_NAME, (data) => {
      console.log("📬 Kuyruktan mesaj alındı:", data.type, "| OrderID:", data.orderId);
      // Burada bildirim gönderme, loglama vs. yapılabilir
    });

    console.log("🔄 Sipariş kuyruğu dinleniyor...");
  } catch (error) {
    console.error("❌ Consumer hatası:", error.message);
  }
};

export default { connectRabbitMQ, sendOrderNotification, sendOrderStatusUpdate, startOrderConsumer };
