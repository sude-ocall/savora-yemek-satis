import amqplib from "amqplib";

const QUEUE = "new_product";
let channel = null;

async function getChannel() {
  if (channel) return channel;
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log("[RabbitMQ] Bağlantı kuruldu, kuyruk hazır:", QUEUE);
    return channel;
  } catch (err) {
    console.warn("[RabbitMQ] Bağlanamadı:", err.message);
    return null;
  }
}

// Yeni ürün eklenince çağrılır — mesajı kuyruğa gönderir.
export async function publishNewProduct(product) {
  const ch = await getChannel();
  if (!ch) return;

  const msg = JSON.stringify({
    event: "new_product",
    productId: product._id,
    name: product.name,
    category: product.category,
    price: product.price,
    timestamp: new Date().toISOString()
  });

  ch.sendToQueue(QUEUE, Buffer.from(msg), { persistent: true });
  console.log("[RabbitMQ] Mesaj gönderildi:", msg);
}
