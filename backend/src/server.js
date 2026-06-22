import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRabbitMQ, startOrderConsumer } from "./services/rabbitmqService.js";
import { connectRedis } from "./services/redisService.js";

dotenv.config();

connectDB();

// ─── RabbitMQ başlat ─────────────────────────────────────────────────────────
connectRabbitMQ().then(() => {
  startOrderConsumer().catch(() => {});
}).catch(() => {
  console.log("⚠️ RabbitMQ olmadan devam ediliyor...");
});

// ─── Redis başlat ────────────────────────────────────────────────────────────
connectRedis().catch(() => {
  console.log("⚠️ Redis olmadan devam ediliyor...");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Ağ üzerinden erişim: http://10.138.16.28:${PORT}`);
});