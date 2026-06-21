import User from "../models/userModel.js";

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

    // Basit hash (gerçek projede AES-256 kullanılmalı)
    const cardHash = Buffer.from(rawNumber).toString("base64");

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
