import connectDB from "../src/config/db.js";
import app from "../src/app.js";

// Serverless: her istekte DB bağlantısını kontrol et
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}