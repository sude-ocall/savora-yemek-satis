import Offer from "../models/offerModel.js";
import Order from "../models/orderModel.js";

// USER → TEKLİF OLUŞTUR
export const createOfferRequest = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const offer = await Offer.create({
      userId: req.user._id,
      menuRequest: { title, description, category }
    });
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SATICI → AÇIK TEKLİFLERİ GETİR
export const getOpenOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ status: "open" });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SATICI → TEKLİF EKLE
export const addRestaurantOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { price, message } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Teklif bulunamadı." });
    if (offer.status !== "open") return res.status(400).json({ message: "Bu teklif kapalı." });

    offer.incomingOffers.push({ restaurantId: req.seller._id, price, message });
    await offer.save();
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER → KENDİ TEKLİFLERİNİ GETİR
export const getUserOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ userId: req.user._id })
      .populate("incomingOffers.restaurantId", "restaurantName");
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER → TEKLİFİ KABUL ET → Sipariş oluştur, teklifi kapat
export const acceptOffer = async (req, res) => {
  try {
    const { offerId, restaurantId, price, note } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Teklif bulunamadı." });
    if (offer.status !== "open") return res.status(400).json({ message: "Bu teklif zaten kapatılmış." });

    // note alanı da kaydediliyor
    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      menu: [],
      note: note || "",
      status: "new"
    });

    offer.status = "closed";
    await offer.save();

    res.status(201).json({ message: "Sipariş başarıyla oluşturuldu.", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};