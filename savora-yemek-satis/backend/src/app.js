import express from "express";
import cors from "cors";
// İçe aktardığın diğer dosyalar burada kalsın
import userRoutes from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();

// CORS'u herkes için açıyoruz (Telefondan gelen isteği engellememesi için)
app.use(cors()); 

// JSON verilerini okumak için
app.use(express.json());

// Routes (Yollar)
app.use("/api/users", userRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/reviews", reviewRoutes);

export default app;