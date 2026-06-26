import dotenv from "dotenv";
import app from "../src/app.js";
import connectDB from "../src/config/db.js";
import { connectRabbitMQ, startOrderConsumer } from "../src/services/rabbitmqService.js";
import { connectRedis } from "../src/services/redisService.js";

dotenv.config();

connectRabbitMQ().then(() => {
  startOrderConsumer().catch(() => {});
}).catch(() => {});

connectRedis().catch(() => {});

export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
