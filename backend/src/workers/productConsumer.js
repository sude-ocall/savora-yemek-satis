// Ayrı bir terminal penceresinde çalıştır:
//   node src/workers/productConsumer.js
//
// Bu script RabbitMQ kuyruğunu dinler ve yeni ürün mesajlarını loglar.

import dotenv from "dotenv";
import amqplib from "amqplib";
dotenv.config();

const QUEUE = "new_product";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

async function startConsumer() {
  try {
    const conn = await amqplib.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    console.log(`[Consumer] Kuyruk dinleniyor: "${QUEUE}" — Çıkmak için Ctrl+C`);

    channel.consume(QUEUE, (msg) => {
      if (!msg) return;
      const data = JSON.parse(msg.content.toString());
      console.log("\n[Consumer] YENİ ÜRÜN MESAJI ALINDI:");
      console.log("  Olay    :", data.event);
      console.log("  Ürün ID :", data.productId);
      console.log("  Ad      :", data.name);
      console.log("  Kategori:", data.category);
      console.log("  Fiyat   :", data.price, "₺");
      console.log("  Zaman   :", data.timestamp);
      channel.ack(msg); // mesajı işlendi olarak işaretle
    });
  } catch (err) {
    console.error("[Consumer] Hata:", err.message);
    process.exit(1);
  }
}

startConsumer();
