import express from "express";
import cors from "cors";
import userRoutes    from "./routes/userRoutes.js";
import sellerRoutes  from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes   from "./routes/orderRoutes.js";
import offerRoutes   from "./routes/offerRoutes.js";
import reviewRoutes  from "./routes/reviewRoutes.js";

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://savora-yemek-satis-frontend.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// ─── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json());

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