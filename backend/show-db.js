import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/userModel.js";

dotenv.config();

async function showDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: "musteri@test.com" });
    
    if (user && user.creditCards && user.creditCards.length > 0) {
      console.log("\n✅ MongoDB'den Veri Başarıyla Çekildi!\n");
      console.log("=== KULLANICI KREDİ KARTI BİLGİLERİ (VERİTABANI GÖRÜNÜMÜ) ===");
      console.log("Kullanıcı E-posta :", user.email);
      console.log("Açık Olarak Tutulan (Son 4 Hane) :", user.creditCards[0].last4);
      console.log("Son Kullanma Tarihi :", user.creditCards[0].expiryDate);
      console.log("\n🔒 Şifrelenmiş Asıl Kart Verisi (AES-256) [cardHash] :");
      console.log("\x1b[32m%s\x1b[0m", user.creditCards[0].cardHash); // Yeşile boyar
      console.log("=============================================================\n");
    } else {
      console.log("Sistemde kartı kayıtlı bir müşteri bulunamadı. Lütfen önce mobilden bir kart ekleyin.");
    }
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    mongoose.connection.close();
  }
}

showDb();
