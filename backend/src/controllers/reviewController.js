import Review from "../models/reviewModel.js";

// GET /api/reviews/:sellerId
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ sellerId: req.params.sellerId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/reviews/:sellerId  (protectUser ile korumalı)
export const addReview = async (req, res) => {
  try {
    const { text, rating } = req.body;

    if (!text || !rating) {
      return res.status(400).json({ message: "Yorum ve puan zorunludur." });
    }

    const review = await Review.create({
      sellerId: req.params.sellerId,
      user:     req.user.name,        // JWT'den gelen gerçek kullanıcı adı
      text,
      rating: Number(rating)
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};