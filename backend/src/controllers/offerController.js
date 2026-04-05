import Offer from "../models/offerModel.js";
import Order from "../models/orderModel.js"; // ❗ KRİTİK EKLENDİ

// USER OFFER CREATE
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

// SELLER → OPEN OFFERS
export const getOpenOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ status: "open" });

    res.json(offers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SELLER → OFFER ADD
export const addRestaurantOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { price, message } = req.body;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    offer.incomingOffers.push({
      restaurantId: req.seller._id,
      price,
      message
    });

    await offer.save();

    res.json(offer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER → LIST OWN OFFERS
export const getUserOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ userId: req.user._id });

    res.json(offers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER → ACCEPT OFFER (🔥 FIXED VERSION)
export const acceptOffer = async (req, res) => {
  try {
    const { offerId, restaurantId, price } = req.body;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.status !== "open") {
      return res.status(400).json({ message: "Offer already closed" });
    }

    // ORDER CREATE (REAL STRUCTURE)
    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      menu: [
        {
          productId: null,
          quantity: 1
        }
      ],
      status: "new"
    });

    // CLOSE OFFER
    offer.status = "closed";
    await offer.save();

    res.status(201).json({
      message: "Order created successfully",
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};