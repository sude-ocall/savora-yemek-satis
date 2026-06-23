import express from "express";
import cors from "cors";
import userRoutes    from "./routes/userRoutes.js";
import sellerRoutes  from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes   from "./routes/orderRoutes.js";
import offerRoutes   from "./routes/offerRoutes.js";
import reviewRoutes  from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8081",
  "http://localhost:19006",
  "http://10.138.16.28:5173",
  "http://10.138.16.28:8081",
  "http://10.138.16.28:19006",
  "https://savora-yemek-satis-frontend.vercel.app"
];

const corsOptions = {
  origin: function(origin, callback) {
    // Postman, mobil uygulama veya server-side request (origin yok)
    if (!origin) return callback(null, true);

    // Vercel preview URL desteği + yerel ağ IP desteği
    if (
      allowedOrigins.includes(origin) ||
      (origin && origin.includes("vercel.app")) ||
      (origin && origin.startsWith("http://192.168.")) ||
      (origin && origin.startsWith("http://10."))
    ) {
      return callback(null, true);
    }

    return callback(new Error("CORS hatasi: " + origin));
  },
  credentials: true, // cookie/auth için zorunlu
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// ─── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json());

// ─── İstek logu (kanıt için) — her isteği ve dönen HTTP durumunu terminale yazar
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(`➡️  ${req.method} ${req.originalUrl} → ${res.statusCode}`);
  });
  next();
});

// ─── ROOT TEST (Vercel için) ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/users",    userRoutes);
app.use("/api/sellers",  sellerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/offers",   offerRoutes);
app.use("/api/reviews",  reviewRoutes);
app.use("/api/payments", paymentRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  console.log("404 - eslesme yok:", req.method, req.originalUrl);
  res.status(404).json({ message: "Route bulunamadi: " + req.method + " " + req.originalUrl });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Sunucu hatasi:", err.message);
  res.status(err.status || 500).json({ message: err.message || "Sunucu hatasi" });
});

export default app;