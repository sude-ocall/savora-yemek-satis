//import { createClient } from "redis";
import Offer from "../models/offerModel.js";
import Order from "../models/orderModel.js";

//const redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
//redisClient.connect().catch(() => console.log("Redis baglantisi kurulamadi."));

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

export const getOpenOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ status: "open" });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRestaurantOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { price, message } = req.body;
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Teklif bulunamadi." });
    if (offer.status !== "open") return res.status(400).json({ message: "Bu teklif kapali." });
    offer.incomingOffers.push({ restaurantId: req.seller._id, price, message });
    await offer.save();
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ userId: req.user._id })
      .populate("incomingOffers.restaurantId", "restaurantName");
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptOffer = async (req, res) => {
  try {
    const { offerId, restaurantId, price, note } = req.body;
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Teklif bulunamadi." });
    if (offer.status !== "open") return res.status(400).json({ message: "Bu teklif zaten kapatilmis." });
    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      menu: [],
      note: note || "",
      status: "new"
    });
    offer.status = "closed";
    await offer.save();
    res.status(201).json({ message: "Siparis basariyla olusturuldu.", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRegionalOffers = async (req, res) => {
  try {
    const cacheKey = "regional_offers";
   // const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const offers = await Offer.find({ status: "open" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
   // await redisClient.setEx(cacheKey, 60, JSON.stringify(offers));
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRestaurantOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { price, message } = req.body;
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Talep bulunamadi." });
    const existingOffer = offer.incomingOffers.find(
      (o) => o.restaurantId.toString() === req.seller._id.toString()
    );
    if (!existingOffer) return res.status(404).json({ message: "Once teklif verin." });
    existingOffer.price = price;
    existingOffer.message = message || existingOffer.message;
    await offer.save();
    res.json({ message: "Teklif guncellendi.", offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOfferRequest = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Talep bulunamadi." });
    if (offer.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Yetkiniz yok." });
    }
    await Offer.findByIdAndDelete(offerId);
    res.json({ message: "Talep geri cekildi." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};