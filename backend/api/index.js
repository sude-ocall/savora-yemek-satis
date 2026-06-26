import dotenv from "dotenv";
import app from "../src/app.js";
import connectDB from "../src/config/db.js";
import { connectRabbitMQ, startOrderConsumer } from "../src/services/rabbitmqService.js";
import { connectRedis } from "../src/services/redisService.js";

dotenv.config();

connectDB();

connectRabbitMQ().then(() => {
  startOrderConsumer().catch(() => {});
}).catch(() => {
  console.log("⚠️ RabbitMQ olmadan devam ediliyor...");
});

connectRedis().catch(() => {
  console.log("⚠️ Redis olmadan devam ediliyor...");
});

export default app;
