import amqplib from "amqplib";

let channel = null;
const QUEUE_NAME = "order_notifications";

// ─── RabbitMQ Bağlantısı ─────────────────────────────────────────────────────
export const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(
      process.env.RABBITMQ_URL || "amqp://localhost:5672"
    );
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log("✅ RabbitMQ bağlantısı kuruldu. Kuyruk:", QUEUE_NAME);

    // Bağlantı kapandığında yeniden bağlan
    connection.on("close", () => {
      console.log("⚠️ RabbitMQ bağlantısı kapandı. Yeniden bağlanılıyor...");
      setTimeout(connectRabbitMQ, 5000);
    });

    return channel;
  } catch (error) {
    console.error("❌ RabbitMQ bağlantı hatası:", error.message);
    console.log("⏳ 5 saniye sonra tekrar denenecek...");
    setTimeout(connectRabbitMQ, 5000);
    return null;
  }
};

// ─── Sipariş Bildirim Mesajı Gönder ─────────────────────────────────────────
export const sendOrderNotification = async (orderData) => {
  try {
    if (!channel) {
      console.warn("⚠️ RabbitMQ kanalı mevcut değil, mesaj gönderilemedi.");
      return false;
    }

    const message = JSON.stringify({
      type: "NEW_ORDER",
      orderId: orderData._id,
      userId: orderData.userId,
      restaurantId: orderData.restaurantId,
      itemCount: orderData.menu?.length || 0,
      timestamp: new Date().toISOString()
    });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(message), {
      persistent: true
    });

    console.log("📨 Sipariş bildirimi kuyruğa gönderildi:", orderData._id);
    return true;
  } catch (error) {
    console.error("❌ RabbitMQ mesaj gönderme hatası:", error.message);
    return false;
  }
};

// ─── Sipariş Durumu Güncelleme Mesajı ────────────────────────────────────────
export const sendOrderStatusUpdate = async (orderId, newStatus) => {
  try {
    if (!channel) return false;

    const message = JSON.stringify({
      type: "ORDER_STATUS_UPDATE",
      orderId,
      newStatus,
      timestamp: new Date().toISOString()
    });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(message), {
      persistent: true
    });

    console.log(`📨 Sipariş durumu güncellendi: ${orderId} → ${newStatus}`);
    return true;
  } catch (error) {
    console.error("❌ Durum güncelleme mesajı hatası:", error.message);
    return false;
  }
};

// ─── Kuyruktan Mesaj Tüketici (Consumer) ────────────────────────────────────
export const startOrderConsumer = async () => {
  try {
    if (!channel) return;

    channel.consume(QUEUE_NAME, (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        console.log("📬 Kuyruktan mesaj alındı:", data.type, "| OrderID:", data.orderId);

        // Burada bildirim gönderme, loglama vs. yapılabilir
        channel.ack(msg);
      }
    });

    console.log("🔄 Sipariş kuyruğu dinleniyor...");
  } catch (error) {
    console.error("❌ Consumer hatası:", error.message);
  }
};

export default { connectRabbitMQ, sendOrderNotification, sendOrderStatusUpdate, startOrderConsumer };
