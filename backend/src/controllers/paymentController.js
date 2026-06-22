import User from "../models/userModel.js";
import crypto from "crypto";

// AES-256 için gizli anahtar (Gerçekte .env içinde olmalı, burada örnek olarak JWT_SECRET veya sabit bir key kullanıyoruz)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// ===================== SAVE PAYMENT METHOD =====================
export const savePaymentMethod = async (req, res) => {
  try {
    const { cardNumber, expiryDate, cardHolderName } = req.body;

    if (!cardNumber || !expiryDate) {
      return res.status(400).json({ message: "Kart numarası ve son kullanma tarihi zorunludur." });
    }

    // Kart numarasından sadece son 4 haneyi al
    const rawNumber = cardNumber.replace(/\s/g, "");
    const last4 = rawNumber.slice(-4);

    // AES-256 simetrik şifreleme algoritması ile kartı şifrele
    const cardHash = encrypt(rawNumber);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          creditCards: {
            cardHash,
            last4,
            expiryDate
          }
        }
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Videoda güzel görünmesi için terminale log basalım
    console.log(`💳 Kullanıcı (ID: ${req.user._id}) için yeni ödeme yöntemi kaydedildi (Son 4 hane: ${last4}, Şifreli: Başarılı)`);

    res.status(201).json({
      message: "Ödeme yöntemi başarıyla kaydedildi.",
      card: {
        last4,
        expiryDate,
        cardHolderName: cardHolderName || ""
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== GET PAYMENT METHODS =====================
export const getPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("creditCards");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const cards = (user.creditCards || []).map((card, index) => ({
      id: index,
      last4: card.last4,
      expiryDate: card.expiryDate
    }));

    res.json({ cards });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

// ===================== DELETE PAYMENT METHOD =====================
export const deletePaymentMethod = async (req, res) => {
  try {
    const { index } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    if (!user.creditCards || Number(index) >= user.creditCards.length || Number(index) < 0) {
      return res.status(400).json({ message: "Geçersiz kart indeksi." });
    }

    user.creditCards.splice(Number(index), 1);
    await user.save();

    res.json({
      message: "Ödeme yöntemi başarıyla silindi.",
      cards: user.creditCards.map((card, i) => ({
        id: i,
        last4: card.last4,
        expiryDate: card.expiryDate
      }))
    });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};
